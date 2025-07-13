import React, { useState, useEffect } from 'react'
import { formatTime } from './data/sampleData'
import { loadData, loadSchools } from './services/dataService'
import type { 
  ClassFilter, 
  GenderFilter, 
  WeekFilter, 
  YearFilter, 
  TabType, 
  Runner,
  SortState,
  SortableColumn,
  SortDirection
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
  
  // Sorting state
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    direction: null
  })
  
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

  // Sorting utility function
  const sortData = (data: Runner[], column: SortableColumn, direction: SortDirection): Runner[] => {
    if (!direction) return data

    return [...data].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (column) {
        case 'rank':
          aValue = a.rnk_blnd
          bValue = b.rnk_blnd
          break
        case 'name':
          aValue = a.Name.toLowerCase()
          bValue = b.Name.toLowerCase()
          break
        case 'school':
          aValue = a.School.toLowerCase()
          bValue = b.School.toLowerCase()
          break
        case 'points':
          aValue = a.points
          bValue = b.points
          break
        case 'time':
          aValue = a.time_min
          bValue = b.time_min
          break
        case 'class':
          aValue = a.school_class
          bValue = b.school_class
          break
        default:
          return 0
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (direction === 'asc') {
          return aValue.localeCompare(bValue)
        } else {
          return bValue.localeCompare(aValue)
        }
      } else {
        if (direction === 'asc') {
          return (aValue as number) - (bValue as number)
        } else {
          return (bValue as number) - (aValue as number)
        }
      }
    })
  }

  // Handle sort column click
  const handleSort = (column: SortableColumn): void => {
    setSortState(prev => {
      if (prev.column === column) {
        // Cycle through: asc -> desc -> null
        if (prev.direction === 'asc') {
          return { column, direction: 'desc' }
        } else if (prev.direction === 'desc') {
          return { column: null, direction: null }
        } else {
          return { column, direction: 'asc' }
        }
      } else {
        // New column, start with asc
        return { column, direction: 'asc' }
      }
    })
  }

  // Get sort indicator
  const getSortIndicator = (column: SortableColumn): string => {
    if (sortState.column !== column) return '↕'
    if (sortState.direction === 'asc') return '↑'
    if (sortState.direction === 'desc') return '↓'
    return '↕'
  }

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
    
    // Apply sorting
    if (sortState.column && sortState.direction) {
      filteredData = sortData(filteredData, sortState.column, sortState.direction)
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
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Modern Sidebar */}
      <div className="w-80 min-w-80 max-w-80">
        <div className="card">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              SD XC Rankings
            </h2>
            <p className="text-text-secondary text-sm">
              Filter and explore cross country data
            </p>
          </div>
          
          <div className="space-y-6">
            {/* Gender Selection - Most Important */}
            <div className="filter-group">
              <label className="filter-label">Gender</label>
              <div className="radio-group">
                {[
                  { value: 'M' as GenderFilter, label: 'Boys', icon: '🏃‍♂️' },
                  { value: 'F' as GenderFilter, label: 'Girls', icon: '🏃‍♀️' }
                ].map(option => (
                  <label key={option.value} className={`radio-option ${selectedGender === option.value ? 'radio-option-selected' : ''}`}>
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={selectedGender === option.value}
                      onChange={(e) => setSelectedGender(e.target.value as GenderFilter)}
                      className="radio-input"
                    />
                    <span className="text-lg">{option.icon}</span>
                    <span className="radio-text">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Class Selection */}
            <div className="filter-group">
              <label className="filter-label">Class</label>
              <div className="radio-group">
                {[
                  { value: 'classall' as ClassFilter, label: 'All Classes' },
                  { value: 'B' as ClassFilter, label: 'Class B' },
                  { value: 'A' as ClassFilter, label: 'Class A' },
                  { value: 'AA' as ClassFilter, label: 'Class AA' }
                ].map(option => (
                  <label key={option.value} className={`radio-option ${selectedClass === option.value ? 'radio-option-selected' : ''}`}>
                    <input
                      type="radio"
                      name="class"
                      value={option.value}
                      checked={selectedClass === option.value}
                      onChange={(e) => setSelectedClass(e.target.value as ClassFilter)}
                      className="radio-input"
                    />
                    <span className="radio-text">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Week Selection */}
            <div className="filter-group">
              <label className="filter-label">Week</label>
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 7 }, (_, i) => {
                  const weekValue = `week${i + 1}` as WeekFilter
                  return (
                    <label key={i + 1} className={`radio-option ${selectedWeek === weekValue ? 'radio-option-selected' : ''}`}>
                      <input
                        type="radio"
                        name="week"
                        value={weekValue}
                        checked={selectedWeek === weekValue}
                        onChange={(e) => setSelectedWeek(e.target.value as WeekFilter)}
                        className="radio-input"
                      />
                      <span className="radio-text">W{i + 1}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Year Selection - Least Important, at bottom */}
            <div className="filter-group">
              <label className="filter-label">Year</label>
              <div className="grid grid-cols-2 gap-2">
                {(['2023', '2024'] as YearFilter[]).map(year => (
                  <label key={year} className={`radio-option ${selectedYear === year ? 'radio-option-selected' : ''}`}>
                    <input
                      type="radio"
                      name="year"
                      value={year}
                      checked={selectedYear === year}
                      onChange={(e) => setSelectedYear(e.target.value as YearFilter)}
                      className="radio-input"
                    />
                    <span className="radio-text">{year}</span>
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
          <div className="mb-6 space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or school..."
                value={rankingsSearchTerm}
                onChange={(e) => setRankingsSearchTerm(e.target.value)}
                className="w-full p-4 pl-12 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            {sortState.column && (
              <div className="flex items-center justify-between p-3 bg-primary-lighter rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-text-secondary">
                    Sorted by: <span className="font-medium text-text-primary">{sortState.column}</span> 
                    ({sortState.direction === 'asc' ? 'ascending' : 'descending'})
                  </span>
                </div>
                <button
                  onClick={() => setSortState({ column: null, direction: null })}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Clear Sort
                </button>
              </div>
            )}
          </div>
          <div className="overflow-x-auto w-full">
            <table className="min-w-full w-full divide-y divide-border">
              <thead className="bg-background">
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-primary-lighter transition-colors w-20"
                    onClick={() => handleSort('rank')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Rank</span>
                      <span className="text-primary">{getSortIndicator('rank')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-primary-lighter transition-colors w-48"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Name</span>
                      <span className="text-primary">{getSortIndicator('name')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-primary-lighter transition-colors w-48"
                    onClick={() => handleSort('school')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>School</span>
                      <span className="text-primary">{getSortIndicator('school')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-primary-lighter transition-colors w-24"
                    onClick={() => handleSort('points')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Points</span>
                      <span className="text-primary">{getSortIndicator('points')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-primary-lighter transition-colors w-24"
                    onClick={() => handleSort('time')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Time</span>
                      <span className="text-primary">{getSortIndicator('time')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-primary-lighter transition-colors w-20"
                    onClick={() => handleSort('class')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Class</span>
                      <span className="text-primary">{getSortIndicator('class')}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <div className="text-text-secondary">Loading rankings...</div>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  // Render no data rows when error
                  null
                ) : (
                  getFilteredData().map((runner, index) => (
                    <tr key={runner.id} className={index % 2 === 0 ? 'bg-surface' : 'bg-background'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary w-20">
                        {runner.rnk_blnd}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary w-48">
                        {runner.Name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary w-48">
                        {runner.School}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary w-24">
                        {runner.points.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary w-24">
                        {formatTime(runner.time_min)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary w-20">
                        {runner.school_class}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {/* Show error message below the table */}
            {error && (
              <div className="text-lg text-red-600 text-center mt-4">{error}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const filteredSchools = getFilteredSchools()
  const allSchoolsSelected = schools.length > 0 && selectedTeams.length === schools.length
  
  const renderTeamsTab = (): JSX.Element => (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-bold mb-6 text-text-primary">Select Teams</h2>
        
        {/* Search and Select All Controls */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search schools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 pl-12 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              onClick={handleSelectAll}
              className="btn-outline text-sm"
            >
              {allSchoolsSelected ? 'Deselect All' : 'Select All'}
            </button>
            
            {selectedTeams.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-text-secondary">
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
        <div className="border border-border rounded-lg max-h-64 overflow-y-auto bg-background">
          <div className="p-4 space-y-2">
            {filteredSchools.map(school => (
              <label key={school} className="flex items-center space-x-3 p-3 hover:bg-white rounded-lg cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={selectedTeams.includes(school)}
                  onChange={() => handleTeamToggle(school)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="text-text-primary select-none">{school}</span>
              </label>
            ))}
            
            {filteredSchools.length === 0 && searchTerm && (
              <div className="text-text-secondary text-center py-4">
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
            <h3 className="text-lg font-semibold mb-4 text-text-primary">Boys</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-background">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-48">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-48">School</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-20">Class</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-20">Rank</th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-border">
                  {getTeamData('M').map((runner, index) => (
                    <tr key={runner.id} className={index % 2 === 0 ? 'bg-surface' : 'bg-background'}>
                      <td className="px-4 py-3 text-sm text-text-primary w-48">{runner.Name}</td>
                      <td className="px-4 py-3 text-sm text-text-primary w-48">{runner.School}</td>
                      <td className="px-4 py-3 text-sm text-text-primary w-20">{runner.school_class}</td>
                      <td className="px-4 py-3 text-sm text-text-primary w-20">{runner.rnk_blnd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Girls Team */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-text-primary">Girls</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-background">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-48">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-48">School</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-20">Class</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase w-20">Rank</th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-border">
                  {getTeamData('F').map((runner, index) => (
                    <tr key={runner.id} className={index % 2 === 0 ? 'bg-surface' : 'bg-background'}>
                      <td className="px-4 py-3 text-sm text-text-primary w-48">{runner.Name}</td>
                      <td className="px-4 py-3 text-sm text-text-primary w-48">{runner.School}</td>
                      <td className="px-4 py-3 text-sm text-text-primary w-20">{runner.school_class}</td>
                      <td className="px-4 py-3 text-sm text-text-primary w-20">{runner.rnk_blnd}</td>
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-primary">SD XC</div>
            </div>
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('rankings')}
                className={`nav-button ${
                  activeTab === 'rankings'
                    ? 'nav-button-active'
                    : 'nav-button-inactive'
                }`}
              >
                Rankings
              </button>
              <button
                onClick={() => setActiveTab('teams')}
                className={`nav-button ${
                  activeTab === 'teams'
                    ? 'nav-button-active'
                    : 'nav-button-inactive'
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