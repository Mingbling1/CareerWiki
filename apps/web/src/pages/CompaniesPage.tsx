import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Users, Star, Building2, ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Mock data for companies
const mockCompanies = [
  {
    id: '1',
    name: 'Recruit',
    slug: 'recruit',
    logo: null,
    industry: 'Payroll & Finance',
    location: 'California, United States',
    employees: '2.5K',
    rating: 4.5,
    reviews: 1500,
    openPositions: 12,
    description: 'Building customized tools for genomics sequencing projects'
  },
  {
    id: '2',
    name: 'TechCorp',
    slug: 'techcorp',
    logo: null,
    industry: 'Technology',
    location: 'San Francisco, CA',
    employees: '10K+',
    rating: 4.2,
    reviews: 3200,
    openPositions: 45,
    description: 'Leading enterprise software solutions provider'
  },
  {
    id: '3',
    name: 'FinanceHub',
    slug: 'financehub',
    logo: null,
    industry: 'Financial Services',
    location: 'New York, NY',
    employees: '5K',
    rating: 4.0,
    reviews: 890,
    openPositions: 23,
    description: 'Innovative fintech solutions for modern banking'
  },
  {
    id: '4',
    name: 'DesignStudio',
    slug: 'designstudio',
    logo: null,
    industry: 'Design Agency',
    location: 'Austin, TX',
    employees: '500',
    rating: 4.8,
    reviews: 420,
    openPositions: 8,
    description: 'Award-winning creative agency for digital experiences'
  },
  {
    id: '5',
    name: 'CloudScale',
    slug: 'cloudscale',
    logo: null,
    industry: 'Cloud Computing',
    location: 'Seattle, WA',
    employees: '3K',
    rating: 4.3,
    reviews: 1100,
    openPositions: 32,
    description: 'Enterprise cloud infrastructure and services'
  },
  {
    id: '6',
    name: 'HealthPlus',
    slug: 'healthplus',
    logo: null,
    industry: 'Healthcare',
    location: 'Boston, MA',
    employees: '8K',
    rating: 4.1,
    reviews: 2300,
    openPositions: 56,
    description: 'Transforming healthcare through technology'
  }
]

const industries = ['All Industries', 'Technology', 'Finance', 'Healthcare', 'Design', 'Cloud Computing']
const locations = ['All Locations', 'United States', 'Canada', 'Europe', 'Remote']

export function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries')
  const [selectedLocation, setSelectedLocation] = useState('All Locations')

  const filteredCompanies = mockCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-neutral-950 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Empresas</h1>
          <p className="text-neutral-400">Explora perfiles de empresas, organigramas y salarios</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar empresas..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-700 transition-colors"
            />
          </div>

          {/* Industry Filter */}
          <div className="relative">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="appearance-none bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-neutral-700 transition-colors cursor-pointer"
            >
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
          </div>

          {/* Location Filter */}
          <div className="relative">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="appearance-none bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-neutral-700 transition-colors cursor-pointer"
            >
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-neutral-500 mb-4">
          Mostrando {filteredCompanies.length} empresas
        </p>

        {/* Companies Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => (
            <Link key={company.id} to={`/empresa/${company.slug}`}>
              <Card className="border-0 bg-neutral-900/80 hover:bg-neutral-900 transition-all duration-200 group cursor-pointer h-full">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-neutral-800/80 flex items-center justify-center transition-colors">
                      {company.logo ? (
                        <img src={company.logo} alt={company.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <Building2 className="w-7 h-7 text-neutral-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate group-hover:text-violet-400 transition-colors">
                        {company.name}
                      </h3>
                      <p className="text-sm text-neutral-500">{company.industry}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-neutral-400 mb-4 line-clamp-2">
                    {company.description}
                  </p>

                  {/* Location */}
                  <div className="flex items-center gap-1.5 text-sm text-neutral-500 mb-4">
                    <MapPin className="w-3.5 h-3.5" />
                    {company.location}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 pt-4 border-t border-neutral-800/50">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-neutral-500" />
                      <span className="text-sm text-neutral-300">{company.employees}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400" />
                      <span className="text-sm text-neutral-300">{company.rating}</span>
                      <span className="text-xs text-neutral-500">({company.reviews})</span>
                    </div>
                    <div className="ml-auto">
                      <Badge variant="secondary" className="bg-violet-500/10 text-violet-400 border-0">
                        {company.openPositions} jobs
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
