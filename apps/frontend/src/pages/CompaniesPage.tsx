import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Users, Building2, ChevronDown, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api, type Company } from '@/lib/api'

const industries = ['All Industries', 'Tecnología', 'Finanzas', 'Retail', 'Healthcare', 'Design']
const locations = ['All Locations', 'México', 'Estados Unidos', 'Remote']

export function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries')
  const [selectedLocation, setSelectedLocation] = useState('All Locations')
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCompanies() {
      try {
        setLoading(true)
        const data = await api.companies.getAll()
        setCompanies(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching companies:', err)
        setError('Error al cargar las empresas')
      } finally {
        setLoading(false)
      }
    }
    fetchCompanies()
  }, [])

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    const matchesIndustry = selectedIndustry === 'All Industries' || company.industry === selectedIndustry
    const matchesLocation = selectedLocation === 'All Locations' || company.location?.includes(selectedLocation)
    return matchesSearch && matchesIndustry && matchesLocation
  })

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Empresas</h1>
          <p className="text-muted-foreground">Explora perfiles de empresas, organigramas y salarios</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar empresas..."
              className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
            />
          </div>

          {/* Industry Filter */}
          <div className="relative">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="appearance-none bg-secondary border border-border rounded-lg px-4 py-2.5 pr-10 text-sm text-foreground focus:outline-none focus:border-ring transition-colors cursor-pointer"
            >
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Location Filter */}
          <div className="relative">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="appearance-none bg-secondary border border-border rounded-lg px-4 py-2.5 pr-10 text-sm text-foreground focus:outline-none focus:border-ring transition-colors cursor-pointer"
            >
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Results count */}
        {!loading && !error && (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Mostrando {filteredCompanies.length} empresas
            </p>

            {/* Empty State */}
            {filteredCompanies.length === 0 && (
              <div className="text-center py-20">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No se encontraron empresas</p>
              </div>
            )}

            {/* Companies Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompanies.map((company) => (
                <Link key={company.id} to={`/empresa/${company.slug}`}>
                  <Card className="border border-border bg-card hover:bg-accent transition-all duration-200 group cursor-pointer h-full">
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center overflow-hidden transition-colors">
                          {company.logoUrl ? (
                            <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain" />
                          ) : (
                            <Building2 className="w-7 h-7 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {company.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{company.industry}</p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {company.description || 'Sin descripción disponible'}
                      </p>

                      {/* Location */}
                      {company.location && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                          <MapPin className="w-3.5 h-3.5" />
                          {company.location}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 pt-4 border-t border-border">
                        {company.size && (
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">{company.size}</span>
                          </div>
                        )}
                        {company.industry && (
                          <div className="ml-auto">
                            <Badge variant="secondary">
                              {company.industry}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
