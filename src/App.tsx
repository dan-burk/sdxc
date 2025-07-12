import React, { useState } from 'react'
import { sampleRunners, schools, formatTime } from './data/sampleData'
import type { 
  ClassFilter, 
  GenderFilter, 
  WeekFilter, 
  YearFilter, 
  TabType, 
  Runner 
} from './types'

function App(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>('rankings')
  const [selectedClass, setSelectedClass] = useState<ClassFilter>('classall')
  const [selectedGender, setSelectedGender] = useState<GenderFilter>('M')
  const [selectedWeek, setSelectedWeek] = useState<WeekFilter>('week7')
  const [selectedYear, setSelectedYear] = useState<YearFilter>('2023')
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])

  const getCurrentData = (): Runner[] => {
    const genderKey = selectedGender === 'M' ? 'boys' : 'girls'
    const data = sampleRunners[genderKey]?.[selectedYear]?.[selectedWeek] || []
    
    if (selectedClass === 'classall') {
      return data
    }
    return data.filter(runner => runner.schoolClass === selectedClass)
  }

  const getTeamData = (gender: GenderFilter): Runner[] => {
    const genderKey = gender === 'M' ? 'boys' : 'girls'
    const data = sampleRunners[genderKey]?.[selectedYear]?.week7 || []
    
    if (selectedTeams.length === 0) return []
    return data.filter(runner => selectedTeams.includes(runner.school))
  }

  const handleTeamSelectChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const options = event.target.options
    const selectedValues: string[] = []
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value)
      }
    }
    
    setSelectedTeams(selectedValues)
  }

  const RankingsTab = (): JSX.Element => (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <div className="lg:w-1/3 xl:w-1/4">
        <div className="card bg-sdxc-teal">
          <h2 className="text-xl font-bold text-center mb-6 text-gray-800">
            SD High School XC Rankings
          </h2>
          
          <div className="space-y-6">
            {/* Class Selection */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-700">Select Class</h3>
              <div className="space-y-2">
                {[
                  { value: 'B' as ClassFilter, label: 'Class B' },
                  { value: 'A' as ClassFilter, label: 'Class A' },
                  { value: 'AA' as ClassFilter, label: 'Class AA' },
                  { value: 'classall' as ClassFilter, label: 'All Classes' }
                ].map(option => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="class"
                      value={option.value}
                      checked={selectedClass === option.value}
                      onChange={(e) => setSelectedClass(e.target.value as ClassFilter)}
                      className="text-sdxc-green focus:ring-sdxc-green"
                    />
                    <span className="text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-700">Select Gender</h3>
              <div className="space-y-2">
                {[
                  { value: 'M' as GenderFilter, label: 'Male' },
                  { value: 'F' as GenderFilter, label: 'Female' }
                ].map(option => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={selectedGender === option.value}
                      onChange={(e) => setSelectedGender(e.target.value as GenderFilter)}
                      className="text-sdxc-green focus:ring-sdxc-green"
                    />
                    <span className="text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Week Selection */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-700">Select Week</h3>
              <div className="space-y-2">
                {Array.from({ length: 7 }, (_, i) => {
                  const weekValue = `week${i + 1}` as WeekFilter
                  return (
                    <label key={i + 1} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="week"
                        value={weekValue}
                        checked={selectedWeek === weekValue}
                        onChange={(e) => setSelectedWeek(e.target.value as WeekFilter)}
                        className="text-sdxc-green focus:ring-sdxc-green"
                      />
                      <span className="text-gray-700">Week {i + 1}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Year Selection */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-700">Year</h3>
              <div className="flex space-x-4">
                {(['2023', '2024'] as YearFilter[]).map(year => (
                  <label key={year} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="year"
                      value={year}
                      checked={selectedYear === year}
                      onChange={(e) => setSelectedYear(e.target.value as YearFilter)}
                      className="text-sdxc-green focus:ring-sdxc-green"
                    />
                    <span className="text-gray-700">{year}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    School
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Season PR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getCurrentData().map((runner, index) => (
                  <tr key={runner.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {runner.blendedRank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {runner.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {runner.school}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {runner.points.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(runner.timeMin)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {runner.schoolClass}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )

  const TeamsTab = (): JSX.Element => (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Select Teams</h2>
        <select
          multiple
          value={selectedTeams}
          onChange={handleTeamSelectChange}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-sdxc-green focus:border-transparent"
          size={8}
        >
          {schools.map(school => (
            <option key={school} value={school} className="py-1">
              {school}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-600 mt-2">
          Hold Ctrl (or Cmd on Mac) to select multiple teams
        </p>
      </div>

      {selectedTeams.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Boys Team */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Boys</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">School</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getTeamData('M').map((runner, index) => (
                    <tr key={runner.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 text-sm text-gray-900">{runner.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{runner.school}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{runner.schoolClass}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{runner.blendedRank}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Girls Team */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Girls</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">School</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getTeamData('F').map((runner, index) => (
                    <tr key={runner.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 text-sm text-gray-900">{runner.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{runner.school}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{runner.schoolClass}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{runner.blendedRank}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-sdxc-teal border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-gray-800">SD XC</div>
            </div>
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('rankings')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'rankings'
                    ? 'bg-sdxc-dark-teal text-gray-800'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-sdxc-light'
                }`}
              >
                Rankings
              </button>
              <button
                onClick={() => setActiveTab('teams')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'teams'
                    ? 'bg-sdxc-dark-teal text-gray-800'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-sdxc-light'
                }`}
              >
                Teams
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'rankings' ? <RankingsTab /> : <TeamsTab />}
      </main>
    </div>
  )
}

export default App