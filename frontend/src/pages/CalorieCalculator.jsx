import { useState } from 'react'

const TERRAIN_OPTIONS = [
  { value: 'trail', label: 'Maintained Trail', met: 6.0 },
  { value: 'off_trail', label: 'Off-Trail / Bushwhack', met: 7.5 },
  { value: 'snow_sand', label: 'Snow / Sand / Scree', met: 8.5 },
]

const FOOD_EXAMPLES = [
  { name: 'Trail mix / nuts', calPerOz: 170 },
  { name: 'Energy bars', calPerOz: 130 },
  { name: 'Peanut butter', calPerOz: 165 },
  { name: 'Dried fruit', calPerOz: 85 },
  { name: 'Cheese (hard)', calPerOz: 110 },
  { name: 'Tortillas', calPerOz: 85 },
  { name: 'Freeze-dried meals', calPerOz: 110 },
  { name: 'Chocolate', calPerOz: 150 },
  { name: 'Instant oatmeal', calPerOz: 110 },
  { name: 'Jerky', calPerOz: 80 },
]

function lbsToKg(lbs) { return lbs * 0.453592 }
function ftInToCm(ft, inches) { return (ft * 12 + inches) * 2.54 }

function calculateBMR(weightKg, heightCm, age, sex) {
  if (sex === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161
}

function calculateHikingCalories(weightKg, packWeightKg, distanceMi, elevationGainFt, terrain, days) {
  const distPerDay = distanceMi / days
  const elevPerDay = elevationGainFt / days

  const avgGradePercent = (elevPerDay / (distPerDay * 5280)) * 100
  let baseSpeed = 2.5
  if (avgGradePercent > 10) baseSpeed = 1.8
  else if (avgGradePercent > 5) baseSpeed = 2.0
  if (terrain === 'off_trail') baseSpeed *= 0.75
  if (terrain === 'snow_sand') baseSpeed *= 0.6

  const hoursPerDay = distPerDay / baseSpeed

  const baseMET = TERRAIN_OPTIONS.find(t => t.value === terrain)?.met ?? 6.0
  const gradeMETBonus = Math.min(avgGradePercent / 5 * 0.5, 3.0)
  const effectiveMET = baseMET + gradeMETBonus

  const totalWeightKg = weightKg + packWeightKg
  const calPerHour = effectiveMET * totalWeightKg * 1.05

  return { calPerDay: calPerHour * hoursPerDay, hoursPerDay, effectiveMET, baseSpeed }
}

function altitudeMultiplier(altitudeFt) {
  if (altitudeFt < 5000) return 1.0
  const extra = Math.min(((altitudeFt - 5000) / 5000) * 0.05, 0.25)
  return 1 + extra
}

function compute(form) {
  const weight = Number(form.weight) || 0
  const days = Number(form.days) || 0
  const distance = Number(form.distance) || 0
  if (weight <= 0 || days <= 0 || distance <= 0) return null

  const weightKg = lbsToKg(weight)
  const packKg = lbsToKg(Number(form.packWeight) || 0)
  const heightCm = ftInToCm(Number(form.heightFt) || 0, Number(form.heightIn) || 0)

  const bmr = calculateBMR(weightKg, heightCm, form.age, form.sex)
  const hiking = calculateHikingCalories(
    weightKg, packKg, distance, Number(form.elevationGain) || 0, form.terrain, days
  )
  const altMult = altitudeMultiplier(Number(form.altitude) || 0)

  const campCalories = 200
  const subtotal = bmr + hiking.calPerDay + campCalories
  const thermicEffect = subtotal * 0.1
  const dailyCalories = Math.round((subtotal + thermicEffect) * altMult)
  const totalCalories = dailyCalories * days

  const avgCalPerOz = 125
  const ozPerDay = dailyCalories / avgCalPerOz
  const lbsPerDay = ozPerDay / 16
  const totalFoodLbs = lbsPerDay * days

  return {
    bmr: Math.round(bmr),
    hikingCalPerDay: Math.round(hiking.calPerDay),
    campCalories,
    thermicEffect: Math.round(thermicEffect),
    altitudeBonus: Math.round((altMult - 1) * 100),
    dailyCalories,
    totalCalories,
    hoursHikingPerDay: hiking.hoursPerDay.toFixed(1),
    effectiveMET: hiking.effectiveMET.toFixed(1),
    avgSpeed: hiking.baseSpeed.toFixed(1),
    ozPerDay: ozPerDay.toFixed(0),
    lbsPerDay: lbsPerDay.toFixed(1),
    totalFoodLbs: totalFoodLbs.toFixed(1),
    days,
  }
}

const initialForm = {
  sex: 'male',
  age: 30,
  heightFt: 5,
  heightIn: 10,
  weight: 175,
  packWeight: 30,
  distance: 25,
  elevationGain: 4000,
  altitude: 6000,
  terrain: 'trail',
  days: 3,
}

export function CalorieCalculator() {
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  function handleChange(e) {
    const { name, value, type } = e.target
    setForm(f => ({
      ...f,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }))
    setResult(null)
    setError(null)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const r = compute(form)
    if (!r) {
      setError('Weight, distance, and days must be greater than zero.')
      return
    }
    setResult(r)
  }

  function handleReset() {
    setForm(initialForm)
    setResult(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-stone-800 dark:text-stone-100">Calorie Calculator</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Estimate how many calories to pack for your backpacking trip.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Body Stats */}
        <section className="card">
          <h2 className="section-title mb-5">Body Stats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label">Sex</label>
              <select
                name="sex"
                value={form.sex}
                onChange={handleChange}
                className="input-field"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="label">Age</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                min={10}
                max={99}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Height</label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    name="heightFt"
                    value={form.heightFt}
                    onChange={handleChange}
                    min={3}
                    max={8}
                    required
                    className="input-field w-16"
                  />
                  <span className="text-sm text-stone-400 dark:text-stone-500">ft</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    name="heightIn"
                    value={form.heightIn}
                    onChange={handleChange}
                    min={0}
                    max={11}
                    required
                    className="input-field w-16"
                  />
                  <span className="text-sm text-stone-400 dark:text-stone-500">in</span>
                </div>
              </div>
            </div>
            <div>
              <label className="label">Body Weight (lbs)</label>
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                min={80}
                max={400}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Pack Weight (lbs)</label>
              <input
                type="number"
                name="packWeight"
                value={form.packWeight}
                onChange={handleChange}
                min={0}
                max={100}
                required
                className="input-field"
              />
            </div>
          </div>
        </section>

        {/* Trip Details */}
        <section className="card">
          <h2 className="section-title mb-5">Trip Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label">Total Distance (miles)</label>
              <input
                type="number"
                name="distance"
                value={form.distance}
                onChange={handleChange}
                min={1}
                max={500}
                step={0.1}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Elevation Gain (feet)</label>
              <input
                type="number"
                name="elevationGain"
                value={form.elevationGain}
                onChange={handleChange}
                min={0}
                max={30000}
                step={100}
                required
                className="input-field"
              />
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Total gain across the trip (check AllTrails)</p>
            </div>
            <div>
              <label className="label">Base Altitude (feet)</label>
              <input
                type="number"
                name="altitude"
                value={form.altitude}
                onChange={handleChange}
                min={0}
                max={15000}
                step={500}
                required
                className="input-field"
              />
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Higher altitude increases calorie burn</p>
            </div>
            <div>
              <label className="label">Terrain</label>
              <select
                name="terrain"
                value={form.terrain}
                onChange={handleChange}
                className="input-field"
              >
                {TERRAIN_OPTIONS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Number of Days</label>
              <input
                type="number"
                name="days"
                value={form.days}
                onChange={handleChange}
                min={1}
                max={30}
                required
                className="input-field"
              />
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl px-5 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button type="submit" className="btn-primary">
            Calculate
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <section className="bg-forest-50 dark:bg-forest-900/20 rounded-2xl shadow-card p-6">
            <h2 className="section-title text-forest-700 dark:text-forest-300 mb-4">Trip Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-forest-600 dark:text-forest-400">{result.dailyCalories.toLocaleString()}</div>
                <div className="text-xs text-forest-500 dark:text-forest-500 mt-0.5">cal / day</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-forest-600 dark:text-forest-400">{result.totalCalories.toLocaleString()}</div>
                <div className="text-xs text-forest-500 dark:text-forest-500 mt-0.5">total calories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-forest-600 dark:text-forest-400">{result.lbsPerDay}</div>
                <div className="text-xs text-forest-500 dark:text-forest-500 mt-0.5">lbs food / day</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-forest-600 dark:text-forest-400">{result.totalFoodLbs}</div>
                <div className="text-xs text-forest-500 dark:text-forest-500 mt-0.5">lbs food total</div>
              </div>
            </div>
          </section>

          {/* Breakdown */}
          <section className="card">
            <h2 className="section-title mb-4">Daily Breakdown</h2>
            <div className="space-y-2 text-sm">
              <Row label="Basal Metabolic Rate (BMR)" value={`${result.bmr.toLocaleString()} cal`} />
              <Row label={`Hiking (${result.hoursHikingPerDay} hrs at ${result.avgSpeed} mph)`} value={`${result.hikingCalPerDay.toLocaleString()} cal`} />
              <Row label="Camp activities" value={`${result.campCalories} cal`} />
              <Row label="Thermic effect of food (+10%)" value={`${result.thermicEffect.toLocaleString()} cal`} />
              {result.altitudeBonus > 0 && (
                <Row label={`Altitude adjustment (+${result.altitudeBonus}%)`} value="included" />
              )}
              <div className="border-t border-stone-200 dark:border-stone-700 pt-2 mt-2 flex justify-between font-semibold text-stone-800 dark:text-stone-100">
                <span>Daily total</span>
                <span>{result.dailyCalories.toLocaleString()} cal</span>
              </div>
              <div className="flex justify-between font-semibold text-forest-600 dark:text-forest-400">
                <span>Trip total ({result.days} days)</span>
                <span>{result.totalCalories.toLocaleString()} cal</span>
              </div>
            </div>
          </section>

          {/* Food Reference */}
          <section className="card">
            <h2 className="section-title mb-1">Food Reference</h2>
            <p className="text-xs text-stone-400 dark:text-stone-500 mb-4">
              Ounces needed per day to hit {result.dailyCalories.toLocaleString()} cal from a single source.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
              {FOOD_EXAMPLES.map(food => {
                const ozNeeded = (result.dailyCalories / food.calPerOz).toFixed(0)
                return (
                  <div key={food.name} className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-700/50">
                    <span className="text-stone-600 dark:text-stone-300">{food.name}</span>
                    <span className="text-stone-400 dark:text-stone-500 tabular-nums">
                      {food.calPerOz} cal/oz &middot; {ozNeeded} oz
                    </span>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Tips */}
          <section className="bg-amber-warm-light dark:bg-amber-900/20 rounded-2xl shadow-card p-6">
            <h2 className="section-title text-amber-800 dark:text-amber-300 mb-2">Packing Tips</h2>
            <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
              <li>Aim for 100-125 cal/oz calorie density to keep pack weight down</li>
              <li>Plan ~{result.ozPerDay} oz ({result.lbsPerDay} lbs) of food per day</li>
              <li>Bring an extra half-day of food as a safety buffer</li>
              <li>Electrolytes and hydration matter as much as calories at altitude</li>
              <li>Spread calories across meals: 25% breakfast, 50% snacks/lunch, 25% dinner</li>
            </ul>
          </section>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-stone-600 dark:text-stone-300">
      <span>{label}</span>
      <span className="text-stone-800 dark:text-stone-100 tabular-nums">{value}</span>
    </div>
  )
}
