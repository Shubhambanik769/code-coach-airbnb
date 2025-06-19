
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Star, MapPin, Code, Users, TrendingUp, Award, ArrowLeft, ExternalLink, Cloud, Database, Shield, Smartphone, BarChart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const technologyData = {
  'web-development': {
    name: 'Web Development & Related Technologies',
    icon: Code,
    description: 'Web Development is the process of building and maintaining websites and web applications. It encompasses front-end development (user interfaces and experiences), back-end development (server logic and databases), and full-stack development that combines both disciplines.',
    subtitle: 'Whether you\'re building a simple landing page, a complex e-commerce platform, or a sophisticated SaaS application — web development is the foundation of everything on the internet.',
    benefits: [
      { icon: '🌍', title: 'Universal Market Demand', desc: 'Required across all industries and business sectors' },
      { icon: '💻', title: 'Team Integration', desc: 'Essential for product teams, startups, and digital agencies' },
      { icon: '💰', title: 'High ROI Investment', desc: 'Enables freelancing, employment, and entrepreneurship' },
      { icon: '🔧', title: 'Internal Capability', desc: 'Build custom tools, dashboards, and portals in-house' }
    ],
    technologies: [
      'HTML5, CSS3, JavaScript ES6+',
      'React.js, Angular, Vue.js',
      'Node.js, Express.js, Python Django',
      'Git, GitHub, CI/CD Pipelines',
      'MongoDB, MySQL, PostgreSQL',
      'Bootstrap, Tailwind CSS, Sass',
      'REST APIs, GraphQL, Microservices',
      'AWS, Vercel, Netlify, Firebase'
    ],
    gradient: 'from-blue-600 to-cyan-600',
    bgGradient: 'from-blue-50 via-white to-cyan-50'
  },
  'cloud-computing': {
    name: 'Cloud Computing & Infrastructure',
    icon: Cloud,
    description: 'Cloud Computing is the delivery of computing services including servers, storage, databases, networking, software, analytics, and intelligence over the Internet. It enables flexible resources, faster innovation, and economies of scale, allowing businesses to access technology services on-demand.',
    subtitle: 'From startups to Fortune 500 companies, cloud computing has revolutionized how organizations deploy, scale, and manage their technology infrastructure with unprecedented efficiency and cost-effectiveness.',
    benefits: [
      { icon: '🚀', title: 'Scalability & Flexibility', desc: 'Scale resources up or down based on demand instantly' },
      { icon: '💡', title: 'Innovation Enabler', desc: 'Access to cutting-edge services like AI, ML, and IoT' },
      { icon: '📊', title: 'Cost Optimization', desc: 'Pay-as-you-use model reduces infrastructure costs' },
      { icon: '🔒', title: 'Enterprise Security', desc: 'Advanced security features and compliance standards' }
    ],
    technologies: [
      'Amazon Web Services (AWS)',
      'Microsoft Azure, Google Cloud Platform',
      'Docker, Kubernetes, Container Orchestration',
      'Infrastructure as Code (Terraform, CloudFormation)',
      'Serverless Computing (Lambda, Azure Functions)',
      'Cloud Storage (S3, Blob Storage, Cloud Storage)',
      'Cloud Databases (RDS, CosmosDB, BigQuery)',
      'DevOps & CI/CD in Cloud Environments'
    ],
    gradient: 'from-purple-600 to-pink-600',
    bgGradient: 'from-purple-50 via-white to-pink-50'
  },
  'data-science': {
    name: 'Data Science & Analytics',
    icon: Database,
    description: 'Data Science is the interdisciplinary field that combines statistical analysis, machine learning, data visualization, and domain expertise to extract meaningful insights from structured and unstructured data. It empowers organizations to make data-driven decisions and predict future trends.',
    subtitle: 'In today\'s data-driven world, organizations rely on data scientists to unlock the value hidden in their data, from customer behavior analysis to predictive modeling and artificial intelligence applications.',
    benefits: [
      { icon: '📊', title: 'High Demand Career', desc: 'Consistently ranked among top jobs with excellent growth prospects' },
      { icon: '🧠', title: 'AI & ML Integration', desc: 'Foundation for machine learning and artificial intelligence projects' },
      { icon: '💼', title: 'Cross-Industry Value', desc: 'Essential in finance, healthcare, retail, tech, and manufacturing' },
      { icon: '📈', title: 'Business Impact', desc: 'Drive strategic decisions through data-driven insights and predictions' }
    ],
    technologies: [
      'Python, R, SQL for Data Analysis',
      'Pandas, NumPy, Scikit-learn',
      'TensorFlow, PyTorch, Keras',
      'Jupyter Notebooks, Google Colab',
      'Tableau, Power BI, Matplotlib, Seaborn',
      'Apache Spark, Hadoop, Big Data Tools',
      'Statistics, Probability, Linear Algebra',
      'AWS SageMaker, Azure ML, Google AI Platform'
    ],
    gradient: 'from-green-600 to-teal-600',
    bgGradient: 'from-green-50 via-white to-teal-50'
  },
  'cybersecurity': {
    name: 'Cybersecurity & Information Security',
    icon: Shield,
    description: 'Cybersecurity involves protecting digital systems, networks, and data from cyber threats, unauthorized access, and malicious attacks. It encompasses risk assessment, threat detection, incident response, and the implementation of security measures to safeguard organizational and personal digital assets.',
    subtitle: 'With cyber threats evolving rapidly and data breaches costing millions, cybersecurity professionals are the digital guardians protecting organizations from sophisticated attacks and ensuring business continuity.',
    benefits: [
      { icon: '🛡️', title: 'Critical Business Need', desc: 'Essential protection against growing cyber threats and data breaches' },
      { icon: '💰', title: 'High Salary Potential', desc: 'Among the highest-paid technology roles with strong job security' },
      { icon: '🌐', title: 'Remote Opportunities', desc: 'High demand for remote cybersecurity professionals worldwide' },
      { icon: '🎯', title: 'Specialized Expertise', desc: 'Multiple specialization paths from ethical hacking to compliance' }
    ],
    technologies: [
      'Network Security, Firewalls, VPNs',
      'Ethical Hacking, Penetration Testing',
      'SIEM Tools (Splunk, QRadar, ArcSight)',
      'Vulnerability Assessment, Risk Management',
      'Incident Response, Digital Forensics',
      'Cloud Security (AWS, Azure, GCP)',
      'Compliance Frameworks (ISO 27001, NIST, SOC 2)',
      'Security Certifications (CISSP, CEH, CISM)'
    ],
    gradient: 'from-red-600 to-orange-600',
    bgGradient: 'from-red-50 via-white to-orange-50'
  },
  'mobile-development': {
    name: 'Mobile Development & App Creation',
    icon: Smartphone,
    description: 'Mobile Development is the process of creating applications for mobile devices including smartphones and tablets. It encompasses native iOS and Android development, cross-platform solutions, and mobile-first design principles to deliver exceptional user experiences on mobile platforms.',
    subtitle: 'With billions of mobile users worldwide and mobile-first becoming the standard, mobile developers are essential for creating the apps that power our daily digital interactions and business operations.',
    benefits: [
      { icon: '📱', title: 'Mobile-First World', desc: 'Essential skills for the mobile-dominant digital landscape' },
      { icon: '🚀', title: 'App Store Revenue', desc: 'Access to billion-dollar app marketplaces and monetization opportunities' },
      { icon: '🌍', title: 'Global Reach', desc: 'Create apps that can reach millions of users worldwide instantly' },
      { icon: '💡', title: 'Innovation Platform', desc: 'Leverage device capabilities like AR, camera, GPS, and sensors' }
    ],
    technologies: [
      'iOS Development (Swift, SwiftUI, Objective-C)',
      'Android Development (Kotlin, Java, Jetpack Compose)',
      'React Native, Flutter, Xamarin',
      'Mobile UI/UX Design Principles',
      'App Store Optimization (ASO)',
      'Mobile Backend Services (Firebase, AWS Amplify)',
      'Push Notifications, In-App Purchases',
      'Mobile Testing, Performance Optimization'
    ],
    gradient: 'from-indigo-600 to-purple-600',
    bgGradient: 'from-indigo-50 via-white to-purple-50'
  },
  'devops': {
    name: 'DevOps & Infrastructure Automation',
    icon: BarChart,
    description: 'DevOps is a set of practices that combines software development and IT operations to shorten the development lifecycle and deliver high-quality software continuously. It emphasizes automation, monitoring, and collaboration between development and operations teams.',
    subtitle: 'DevOps has transformed how organizations deliver software, enabling faster deployments, improved reliability, and seamless collaboration between development and operations teams in modern software development.',
    benefits: [
      { icon: '⚡', title: 'Faster Deployment', desc: 'Accelerate software delivery with automated pipelines and processes' },
      { icon: '🔄', title: 'Continuous Integration', desc: 'Enable seamless collaboration between development and operations' },
      { icon: '📈', title: 'Career Growth', desc: 'High demand for DevOps engineers with competitive salaries' },
      { icon: '🛠️', title: 'Automation Mastery', desc: 'Master tools and practices that eliminate manual processes' }
    ],
    technologies: [
      'Docker, Kubernetes, Container Orchestration',
      'CI/CD Pipelines (Jenkins, GitLab CI, GitHub Actions)',
      'Infrastructure as Code (Terraform, Ansible, Puppet)',
      'Cloud Platforms (AWS, Azure, GCP)',
      'Monitoring & Logging (Prometheus, Grafana, ELK Stack)',
      'Version Control (Git, GitFlow, Branching Strategies)',
      'Configuration Management, Service Mesh',
      'Microservices Architecture, API Management'
    ],
    gradient: 'from-yellow-600 to-orange-600',
    bgGradient: 'from-yellow-50 via-white to-orange-50'
  }
};

const TechnologyPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const tech = technologyData[slug as keyof typeof technologyData];

  const { data: trainers = [], isLoading } = useQuery({
    queryKey: ['technology-trainers', slug],
    queryFn: async () => {
      let searchTerm = '';
      if (slug === 'web-development') {
        searchTerm = 'web development';
      } else if (slug === 'cloud-computing') {
        searchTerm = 'cloud computing';
      } else if (slug === 'data-science') {
        searchTerm = 'data science';
      } else if (slug === 'cybersecurity') {
        searchTerm = 'cybersecurity';
      }

      const { data, error } = await supabase
        .from('trainers')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'approved')
        .or(`skills.cs.{${searchTerm}},specialization.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%`)
        .order('rating', { ascending: false })
        .order('total_reviews', { ascending: false })
        .limit(8);
      
      if (error) throw error;
      return data || [];
    }
  });

  if (!tech) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Technology Not Found</h1>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const IconComponent = tech.icon;

  const handleViewProfile = (trainerId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate(`/trainer/${trainerId}`);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-amber-400 fill-current' : 'text-slate-300'
        }`}
      />
    ));
  };

  const getTechDisplayName = () => {
    switch(slug) {
      case 'data-science': return 'Data Science';
      case 'cybersecurity': return 'Cybersecurity';
      case 'cloud-computing': return 'Cloud Computing';
      case 'web-development': return 'Web Development';
      default: return 'Technology';
    }
  };

  const getTechColorClass = () => {
    switch(slug) {
      case 'data-science': return 'text-green-600';
      case 'cybersecurity': return 'text-red-600';
      case 'cloud-computing': return 'text-purple-600';
      case 'web-development': return 'text-blue-600';
      default: return 'text-blue-600';
    }
  };

  const getTechBorderClass = () => {
    switch(slug) {
      case 'data-science': return 'border-green-200 hover:border-green-300';
      case 'cybersecurity': return 'border-red-200 hover:border-red-300';
      case 'cloud-computing': return 'border-purple-200 hover:border-purple-300';
      case 'web-development': return 'border-blue-200 hover:border-blue-300';
      default: return 'border-blue-200 hover:border-blue-300';
    }
  };

  const getTechBgClass = () => {
    switch(slug) {
      case 'data-science': return 'hover:bg-green-50';
      case 'cybersecurity': return 'hover:bg-red-50';
      case 'cloud-computing': return 'hover:bg-purple-50';
      case 'web-development': return 'hover:bg-blue-50';
      default: return 'hover:bg-blue-50';
    }
  };

  const getTechGradientBg = () => {
    switch(slug) {
      case 'data-science': return 'from-slate-50 to-green-50';
      case 'cybersecurity': return 'from-slate-50 to-red-50';
      case 'cloud-computing': return 'from-slate-50 to-purple-50';
      case 'web-development': return 'from-slate-50 to-blue-50';
      default: return 'from-slate-50 to-blue-50';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className={`py-20 lg:py-32 bg-gradient-to-br ${tech.bgGradient} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400 rounded-full animate-float"></div>
          <div className="absolute bottom-20 right-20 w-20 h-20 bg-cyan-400 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-indigo-300 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="group hover:bg-white/20 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-8">
              <div className={`w-20 h-20 rounded-3xl bg-gradient-to-r ${tech.gradient} flex items-center justify-center shadow-2xl`}>
                <IconComponent className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              {tech.name}
            </h1>
            
            <div className="flex items-center justify-center mb-8">
              <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-sm font-medium">
                <Users className="w-4 h-4 mr-2" />
                {trainers.length}+ Expert Trainers Available
              </Badge>
            </div>

            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              {tech.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left Column - What is Technology */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center">
                  <span className="text-3xl mr-3">💡</span>
                  What is {getTechDisplayName()}?
                </h2>
                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                  {tech.description}
                </p>
                <div className={`bg-gradient-to-r ${tech.bgGradient} rounded-2xl p-6 border ${getTechBorderClass().split(' ')[0]}`}>
                  <p className="text-slate-700 italic text-lg leading-relaxed">
                    {slug === 'data-science' 
                      ? '"Data science is not just about analyzing numbers—it\'s about transforming raw data into actionable insights that drive business strategy and innovation."'
                      : slug === 'cybersecurity'
                      ? '"Cybersecurity is not just about preventing attacks—it\'s about building resilient systems that protect what matters most in our digital world."'
                      : slug === 'cloud-computing' 
                      ? '"Cloud computing is not just about moving to the cloud—it\'s about transforming how organizations operate, innovate, and scale in the digital economy."'
                      : '"Web development is not just about writing code—it\'s about creating digital experiences that connect businesses with their customers and solve real-world problems."'
                    }
                  </p>
                </div>
              </div>

              {/* Technologies Grid */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <span className="text-2xl mr-3">🛠️</span>
                  Core Technologies & Skills
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {tech.technologies.map((techGroup, index) => (
                    <div key={index} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="font-medium text-slate-800 leading-relaxed">
                        {techGroup}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Why Learn */}
            <div className="lg:pl-8">
              <div className="sticky top-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center">
                  <span className="text-3xl mr-3">📈</span>
                  Why Learn {getTechDisplayName()}?
                </h2>
                <div className="space-y-6">
                  {tech.benefits.map((benefit, index) => (
                    <div key={index} className={`bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 ${getTechBorderClass()}`}>
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl flex-shrink-0">{benefit.icon}</div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg mb-2">{benefit.title}</h4>
                          <p className="text-slate-600 leading-relaxed">{benefit.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA Section */}
                <div className={`mt-8 bg-gradient-to-r ${tech.gradient} rounded-2xl p-8 text-white`}>
                  <h3 className="text-xl font-bold mb-4">Ready to Start Learning?</h3>
                  <p className="mb-6 opacity-90">Connect with our expert trainers and accelerate your {getTechDisplayName().toLowerCase()} journey.</p>
                  <Button 
                    onClick={() => navigate('/trainers')}
                    className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
                  >
                    Find Your Trainer
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Trainers Section */}
      <section className={`py-20 bg-gradient-to-br ${getTechGradientBg()}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 flex items-center justify-center">
              <Award className={`w-10 h-10 mr-4 ${getTechColorClass()}`} />
              Top {getTechDisplayName()} Trainers
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Learn from industry experts with proven track records and real-world experience
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-2xl h-96 shadow-lg"></div>
                </div>
              ))}
            </div>
          ) : trainers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {trainers.map((trainer, index) => {
                const displayName = trainer.name || trainer.profiles?.full_name || 'Professional Trainer';
                const rating = trainer.rating || 0;
                const totalReviews = trainer.total_reviews || 0;
                
                const avatarUrl = trainer.profiles?.avatar_url 
                  ? (trainer.profiles.avatar_url.startsWith('http') 
                      ? trainer.profiles.avatar_url 
                      : `https://rnovcrcvhaeuudqkymiw.supabase.co/storage/v1/object/public/avatars/${trainer.profiles.avatar_url}`)
                  : `https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face`;

                return (
                  <Card 
                    key={trainer.id}
                    className="group cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white border-0 shadow-lg animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-8">
                      <div className="text-center mb-6">
                        <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden shadow-xl ring-4 ring-white">
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = `https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face`;
                            }}
                          />
                        </div>
                        <h3 className={`text-xl font-bold text-slate-900 group-hover:${getTechColorClass()} transition-colors mb-2`}>
                          {displayName}
                        </h3>
                        <p className="text-slate-600 mb-3">{trainer.title}</p>
                        <Badge variant="secondary" className="text-xs">
                          {trainer.specialization}
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-center space-x-1">
                          {rating > 0 ? (
                            <>
                              {renderStars(rating)}
                              <span className="text-sm font-medium text-slate-700 ml-2">
                                {rating.toFixed(1)} ({totalReviews})
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-slate-500">New trainer</span>
                          )}
                        </div>

                        <div className="flex items-center justify-center text-sm text-slate-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          {trainer.location || 'Remote'}
                        </div>

                        <div className="text-center">
                          <div className={`font-bold ${getTechColorClass()} text-2xl`}>
                            ${trainer.hourly_rate || 0}/hr
                          </div>
                        </div>

                        <Button 
                          onClick={() => handleViewProfile(trainer.id)}
                          className={`w-full bg-gradient-to-r ${tech.gradient} hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl`}
                        >
                          {user ? 'View Profile' : 'Login to View'}
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Trainers Found</h3>
                <p className="text-slate-500">We're working on adding more trainers for this technology soon.</p>
              </div>
            </div>
          )}

          <div className="text-center mt-16">
            <Button 
              onClick={() => navigate('/trainers')}
              size="lg" 
              variant="outline"
              className={`px-10 py-4 text-lg font-semibold border-2 ${getTechBorderClass()} ${getTechColorClass()} ${getTechBgClass()} transition-all duration-300`}
            >
              Explore All Trainers
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TechnologyPage;
