import React, { useState, useEffect } from 'react'
import { formatTime } from './data/sampleData'
import { loadData, loadSchools } from './services/dataService'
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
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [rankingsSearchTerm, setRankingsSearchTerm] = useState<string>('')
  
  // Data state
  const [currentData, setCurrentData] = useState<Runner[]>([])
  const [teamDataBoys, setTeamDataBoys] = useState<Runner[]>([])
  const [teamDataGirls, setTeamDataGirls] = useState<Runner[]>([])
  const [schools, setSchools] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Load schools on component mount
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const schoolsData = await loadSchools()
        setSchools(schoolsData)
      } catch (err) {
        console.error('Failed to load schools:', err)
        // Will fallback to default schools in the service
      }
    }
    
    fetchSchools()
  }, [])

  // Load rankings data when filters change
  useEffect(() => {
    const fetchRankingsData = async () => {
      if (activeTab !== 'rankings') return
      
      setLoading(true)
      setError(null)
      
      try {
        const genderKey = selectedGender === 'M' ? 'boys' : 'girls'
        const data = await loadData(genderKey, selectedYear, selectedWeek)
        setCurrentData(data)
      } catch (err) {
        setError('Failed to load rankings data. Please try again.')
        console.error('Error loading rankings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRankingsData()
  }, [selectedGender, selectedYear, selectedWeek, activeTab])

  // Load team data when teams are selected
  useEffect(() => {
    const fetchTeamData = async () => {
      if (activeTab !== 'teams' || selectedTeams.length === 0) {
        setTeamDataBoys([])
        setTeamDataGirls([])
        return
      }
      
      setLoading(true)
      setError(null)
      
      try {
        const [boysData, girlsData] = await Promise.all([
          loadData('boys', selectedYear, 'week7'),
          loadData('girls', selectedYear, 'week7')
        ])
        
        setTeamDataBoys(boysData.filter(runner => selectedTeams.includes(runner.School)))
        setTeamDataGirls(girlsData.filter(runner => selectedTeams.includes(runner.School)))
      } catch (err) {
        setError('Failed to load team data. Please try again.')
        console.error('Error loading teams:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamData()
  }, [selectedTeams, selectedYear, activeTab])

  const getFilteredData = (): Runner[] => {
    let filteredData = currentData
    
    // Filter by class
    if (selectedClass !== 'classall') {
      filteredData = filteredData.filter(runner => runner.school_class === selectedClass)
    }
    
    // Filter by search term
    if (rankingsSearchTerm) {
      filteredData = filteredData.filter(runner => 
        runner.Name.toLowerCase().includes(rankingsSearchTerm.toLowerCase()) ||
        runner.School.toLowerCase().includes(rankingsSearchTerm.toLowerCase())
      )
    }
    
    return filteredData
  }

  const getTeamData = (gender: GenderFilter): Runner[] => {
    if (gender === 'M') {
      return teamDataBoys
    } else {
      return teamDataGirls
    }
  }

  const handleTeamToggle = (school: string): void => {
    setSelectedTeams(prev => {
      if (prev.includes(school)) {
        return prev.filter(team => team !== school)
      } else {
        return [...prev, school]
      }
    })
  }

  const handleSelectAll = (): void => {
    if (selectedTeams.length === schools.length) {
      // If all schools are selected, deselect all
      setSelectedTeams([])
    } else {
      // Select all schools
      setSelectedTeams(schools)
    }
  }

  const getFilteredSchools = (): string[] => {
    if (!searchTerm) return schools
    return schools.filter(school => 
      school.toLowerCase().includes(searchTerm.toLowerCase())
    )
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
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-lg text-gray-600">Loading rankings...</div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-lg text-red-600">{error}</div>
            </div>
          ) : (
            <>
              {/* Search Bar */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search by name or school..."
                  value={rankingsSearchTerm}
                  onChange={(e) => setRankingsSearchTerm(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-sdxc-green focus:border-transparent"
                />
              </div>
              
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
                    {getFilteredData().map((runner, index) => (
                      <tr key={`${runner.id}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {runner.rnk_blnd}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {runner.Name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {runner.School}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {runner.points.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(runner.time_min)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {runner.school_class}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  const filteredSchools = getFilteredSchools()
  const allSchoolsSelected = schools.length > 0 && selectedTeams.length === schools.length
  
  const renderTeamsTab = (): JSX.Element => (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Select Teams</h2>
        
        {/* Search and Select All Controls */}
        <div className="mb-4 space-y-3">
          <input
            type="text"
            placeholder="Search schools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-sdxc-green focus:border-transparent"
          />
          
          <div className="flex items-center justify-between">
            <button
              onClick={handleSelectAll}
              className="btn-secondary text-sm"
            >
              {allSchoolsSelected ? 'Deselect All' : 'Select All'}
            </button>
            
            {selectedTeams.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {selectedTeams.length} team{selectedTeams.length !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => setSelectedTeams([])}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* School Checkboxes */}
        <div className="border border-gray-300 rounded-md max-h-64 overflow-y-auto">
          <div className="p-3 space-y-2">
            {filteredSchools.map(school => (
              <label key={school} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTeams.includes(school)}
                  onChange={() => handleTeamToggle(school)}
                  className="h-4 w-4 text-sdxc-green focus:ring-sdxc-green border-gray-300 rounded"
                />
                <span className="text-gray-700 select-none">{school}</span>
              </label>
            ))}
            
            {filteredSchools.length === 0 && searchTerm && (
              <div className="text-gray-500 text-center py-4">
                No schools found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
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
                      <td className="px-4 py-2 text-sm text-gray-900">{runner.Name}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{runner.School}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{runner.school_class}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{runner.rnk_blnd}</td>
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
                      <td className="px-4 py-2 text-sm text-gray-900">{runner.Name}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{runner.School}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{runner.school_class}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{runner.rnk_blnd}</td>
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
        {activeTab === 'rankings' ? RankingsTab() : renderTeamsTab()}
      </main>
    </div>
  )
}

export default App