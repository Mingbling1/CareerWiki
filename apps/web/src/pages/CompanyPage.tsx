import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Building2, 
  MapPin, 
  Users, 
  Star, 
  TrendingUp,
  ExternalLink,
  Edit3,
  Share2,
  Linkedin,
  Twitter,
  Globe,
  MoreHorizontal
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Mock data for company profile
const mockCompany = {
  id: '1',
  name: 'Recruit',
  slug: 'recruit',
  logo: null,
  coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=400&fit=crop',
  tagline: 'UI/UX designers - how would you like to work within a successful SaaS based firm in downtown Toronto, building customized tools',
  description: `UI/UX designers - how would you like to work within a successful SaaS based firm in downtown Toronto, building customized tools for one of the largest genomics sequencing projects in the world? UI/UX designers - how would you like to work within a successful SaaS based firm in downtown Toronto, building customized tools for one of the largest genomics sequencing projects in the world.`,
  location: 'California, United States',
  founded: 1994,
  industry: 'Payroll & Finance',
  funding: 'Seed Series A',
  founder: 'Two',
  website: 'https://recruit.com',
  socialLinks: {
    linkedin: 'https://linkedin.com/company/recruit',
    twitter: 'https://twitter.com/recruit',
    facebook: 'https://facebook.com/recruit',
    instagram: 'https://instagram.com/recruit'
  },
  stats: {
    revenue: '2.5 B',
    employees: '2.5 K',
    reviews: '1.5 K',
    rating: 4.5
  },
  demographics: {
    male: 60,
    female: 26,
    others: 4
  },
  locations: [
    { name: 'Canada Office', city: 'Toronto, Canada', address: '2118 Thornridge Cir. Syracuse' },
    { name: 'Australia Office', city: 'Sydney, AUS', address: '2715 Ash Dr. San Jose' },
    { name: 'Singapore Office', city: 'Singapore City', address: '4140 Parker Rd. Allentown' }
  ],
  openings: [
    { title: 'Junior HR Manager', category: 'Administrative', status: 'open', salary: '$80K - $100K', location: 'India' },
    { title: 'Senior Product Designer', category: 'Product', status: 'hold', salary: '$80K - $100K', location: 'USA' },
    { title: 'Associate Product Designer', category: 'Marketing', status: 'closed', salary: '$80K - $100K', location: 'UK' }
  ],
  profileValue: [
    { month: 'Jan', value: 5 },
    { month: 'Feb', value: 3 },
    { month: 'Mar', value: 4 },
    { month: 'Apr', value: 6 },
    { month: 'May', value: 5 },
    { month: 'Jun', value: 7 },
    { month: 'Jul', value: 12 },
    { month: 'Aug', value: 15 },
    { month: 'Sep', value: 18 },
    { month: 'Oct', value: 14 },
    { month: 'Nov', value: 10 },
    { month: 'Dec', value: 8 }
  ]
}

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'about', label: 'About' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'salaries', label: 'Salaries' },
  { id: 'photos', label: 'Photos' }
]

function StatusBadge({ status }: { status: string }) {
  const styles = {
    open: 'bg-emerald-500/10 text-emerald-400',
    hold: 'bg-amber-500/10 text-amber-400',
    closed: 'bg-red-500/10 text-red-400'
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${styles[status as keyof typeof styles] || styles.open}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function MiniChart({ data }: { data: typeof mockCompany.profileValue }) {
  const maxValue = Math.max(...data.map(d => d.value))
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - (d.value / maxValue) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="relative h-20 w-full">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(251 146 60)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(251 146 60)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`0,100 ${points} 100,100`}
          fill="url(#chartGradient)"
        />
        <polyline
          points={points}
          fill="none"
          stroke="rgb(251 146 60)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {/* Tooltip indicator for July */}
      <div className="absolute" style={{ left: '58%', top: '15%' }}>
        <div className="bg-neutral-800 text-white text-xs px-2 py-1 rounded shadow-lg">
          <span className="text-neutral-400">July</span>
          <div className="font-medium">15 reviews</div>
        </div>
      </div>
    </div>
  )
}

export function CompanyPage() {
  const { tab } = useParams()
  const [activeTab, setActiveTab] = useState(tab || 'overview')
  const company = mockCompany

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64">
        <img
          src={company.coverImage}
          alt={`${company.name} cover`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent" />
        
        {/* Back button */}
        <Link 
          to="/empresas"
          className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white/80 hover:text-white hover:bg-black/70 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        {/* Go to Website button */}
        <a 
          href={company.website}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-neutral-100 transition-colors"
        >
          Go to Website
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Profile Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Company Header Card */}
            <Card className="border-0 bg-neutral-900/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <div className="w-20 h-20 rounded-xl bg-neutral-800 flex items-center justify-center -mt-14 shadow-xl">
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Building2 className="w-10 h-10 text-neutral-500" />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-1 flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="border-0 bg-neutral-800 hover:bg-neutral-700 text-white">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" size="icon" className="border-0 bg-neutral-800 hover:bg-neutral-700 text-white">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Company Info */}
                <div className="mt-4">
                  <h1 className="text-2xl font-bold text-white">{company.name}</h1>
                  <p className="text-neutral-400 text-sm mt-1">{company.location}</p>
                  <p className="text-neutral-300 text-sm mt-3 leading-relaxed">{company.tagline}</p>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-3 mt-4">
                  <a href={company.socialLinks.linkedin} className="p-2 bg-neutral-800 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href={company.socialLinks.twitter} className="p-2 bg-neutral-800 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors">
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a href={company.socialLinks.facebook} className="p-2 bg-neutral-800 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors">
                    <Globe className="w-4 h-4" />
                  </a>
                  <a href={company.socialLinks.instagram} className="p-2 bg-neutral-800 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors">
                    <Globe className="w-4 h-4" />
                  </a>
                </div>

                {/* Tabs */}
                <div className="mt-6 border-t border-neutral-800 pt-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-transparent p-0 gap-0">
                      {tabs.map((t) => (
                        <TabsTrigger
                          key={t.id}
                          value={t.id}
                          className="px-4 py-2 text-sm font-medium text-neutral-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-violet-500 rounded-none bg-transparent data-[state=active]:bg-transparent"
                        >
                          {t.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-6 mt-6 py-4 border-t border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-800 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Recurring Revenue</p>
                      <p className="text-lg font-bold text-white">{company.stats.revenue}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-800 rounded-lg">
                      <Users className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Total Employees</p>
                      <p className="text-lg font-bold text-white">{company.stats.employees}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-800 rounded-lg">
                      <Star className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Total Reviews</p>
                      <p className="text-lg font-bold text-white">{company.stats.reviews}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-800 rounded-lg">
                      <Star className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Overall Rating</p>
                      <p className="text-lg font-bold text-white">{company.stats.rating}</p>
                    </div>
                  </div>
                </div>

                {/* About Section */}
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-white mb-3">About {company.name}</h2>
                  <p className="text-neutral-400 text-sm leading-relaxed">{company.description}</p>
                </div>

                {/* Profile Value Chart */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Profile value</h2>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <button className="px-3 py-1 rounded-full bg-neutral-800 text-neutral-300">12 months</button>
                      <button className="px-3 py-1 rounded-full hover:bg-neutral-800 text-neutral-500">30 days</button>
                      <button className="px-3 py-1 rounded-full hover:bg-neutral-800 text-neutral-500">7 Days</button>
                    </div>
                  </div>
                  <MiniChart data={company.profileValue} />
                  <div className="flex justify-between text-xs text-neutral-600 mt-2">
                    {company.profileValue.map((d) => (
                      <span key={d.month}>{d.month}</span>
                    ))}
                  </div>
                </div>

                {/* Current Openings */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Current Openings</h2>
                    <button className="text-sm text-violet-400 hover:text-violet-300">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs text-neutral-500 border-b border-neutral-800">
                          <th className="pb-3 font-medium">Job Title</th>
                          <th className="pb-3 font-medium">Category</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Salary</th>
                          <th className="pb-3 font-medium">Location</th>
                          <th className="pb-3 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {company.openings.map((job, i) => (
                          <tr key={i} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                            <td className="py-4 text-white font-medium">{job.title}</td>
                            <td className="py-4 text-neutral-400">{job.category}</td>
                            <td className="py-4">
                              <StatusBadge status={job.status} />
                            </td>
                            <td className="py-4 text-neutral-300">{job.salary}</td>
                            <td className="py-4 text-neutral-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </td>
                            <td className="py-4">
                              <button className="p-1 hover:bg-neutral-700 rounded">
                                <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-4">
            {/* Organization Status Card */}
            <Card className="border-0 bg-neutral-900/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-white">Organization status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500">Founded</span>
                  <span className="text-sm text-white">{company.founded}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500">Industry</span>
                  <span className="text-sm text-white">{company.industry}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500">Funding</span>
                  <span className="text-sm text-white">{company.funding}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500">Founder</span>
                  <span className="text-sm text-white">{company.founder}</span>
                </div>
              </CardContent>
            </Card>

            {/* Employees by Gender Card */}
            <Card className="border-0 bg-neutral-900/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-white">Employees by gender</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Progress bar */}
                <div className="h-2 rounded-full overflow-hidden flex mb-4">
                  <div 
                    className="bg-emerald-500" 
                    style={{ width: `${company.demographics.male}%` }} 
                  />
                  <div 
                    className="bg-violet-500" 
                    style={{ width: `${company.demographics.female}%` }} 
                  />
                  <div 
                    className="bg-amber-500" 
                    style={{ width: `${company.demographics.others}%` }} 
                  />
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-neutral-400">Male</span>
                    <span className="text-white font-medium">{company.demographics.male}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-violet-500" />
                    <span className="text-neutral-400">Female</span>
                    <span className="text-white font-medium">{company.demographics.female}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-neutral-400">Others</span>
                    <span className="text-white font-medium">{company.demographics.others}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Locations Card */}
            <Card className="border-0 bg-neutral-900/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-white">Locations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.locations.map((loc, i) => (
                  <div key={i}>
                    <p className="text-sm font-medium text-white">{loc.name}</p>
                    <p className="text-xs text-neutral-500">{loc.city}</p>
                    <p className="text-xs text-neutral-600">{loc.address}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
