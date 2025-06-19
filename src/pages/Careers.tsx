import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Clock, Users, Briefcase, Heart, Zap, Coffee, Globe, ExternalLink } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  external_form_link?: string;
  created_at: string;
}

const Careers = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  useEffect(() => {
    console.log('Careers page loaded');
  }, []);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Job[];
    }
  });

  const perks = [
    {
      icon: Heart,
      title: 'Health & Wellness',
      description: 'Comprehensive health coverage',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: Zap,
      title: 'Learning Budget',
      description: '$2000 annual learning allowance',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Coffee,
      title: 'Flexible Hours',
      description: 'Work when you\'re most productive',
      color: 'from-blue-500 to-purple-500'
    },
    {
      icon: Globe,
      title: 'Remote First',
      description: 'Work from anywhere in the world',
      color: 'from-green-500 to-teal-500'
    }
  ];

  const departments = ['all', ...new Set(jobs.map(job => job.department))];
  const filteredJobs = selectedDepartment === 'all' 
    ? jobs 
    : jobs.filter(job => job.department === selectedDepartment);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-32 h-32 bg-yellow-200 rounded-full opacity-20 animate-float"></div>
          <div className="absolute top-40 right-10 w-24 h-24 bg-blue-200 rounded-full opacity-25 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-purple-200 rounded-full opacity-15 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium mb-6 animate-fade-in">
            <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
            Join Our Mission
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Build the Future of
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Learning</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Help us democratize access to world-class tech education. Join a team that's passionate about connecting learners with expert mentors.
          </p>
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => document.getElementById('open-positions')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Open Positions
            </Button>
          </div>
        </div>
      </section>

      {/* Perks Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why You'll Love Working Here</h2>
            <p className="text-lg text-gray-600">Amazing perks that make work feel less like work</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map((perk, index) => {
              const IconComponent = perk.icon;
              return (
                <Card key={perk.title} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 mx-auto mb-4 bg-gradient-to-r ${perk.color} rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300`}>
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{perk.title}</h3>
                    <p className="text-gray-600 text-sm">{perk.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="open-positions" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Open Positions</h2>
            <p className="text-lg text-gray-600">Find your perfect role and join our growing team</p>
          </div>

          {/* Department Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {departments.map((dept) => (
              <Button
                key={dept}
                variant={selectedDepartment === dept ? "default" : "outline"}
                onClick={() => setSelectedDepartment(dept)}
                className="capitalize"
              >
                {dept === 'all' ? 'All Departments' : dept}
              </Button>
            ))}
          </div>

          {/* Jobs List */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading positions...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No positions available</h3>
                <p className="text-gray-500">Check back soon for new opportunities!</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <Card key={job.id} className="shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </h3>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                            {job.department}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.type}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-4">{job.description}</p>
                        
                        {job.requirements && job.requirements.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Key Requirements:</h4>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                              {job.requirements.slice(0, 3).map((req, index) => (
                                <li key={index}>{req}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 md:mt-0 md:ml-6">
                        {job.external_form_link ? (
                          <Button 
                            asChild
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          >
                            <a 
                              href={job.external_form_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              Apply Now
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        ) : (
                          <Button 
                            variant="outline"
                            disabled
                            className="text-gray-500"
                          >
                            Coming Soon
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;
