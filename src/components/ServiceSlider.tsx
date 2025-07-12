import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const services = [
  {
    id: 1,
    icon: '💻',
    title: 'Web Development & Tech Training',
    subtitle: 'Code your career forward',
    description: 'Hands-on, job-ready tech courses',
    bgColor: 'bg-gradient-to-br from-blue-500 to-purple-600',
    textColor: 'text-white'
  },
  {
    id: 2,
    icon: '🎤',
    title: 'Soft Skills & Communication',
    subtitle: 'Speak to lead, not just to talk',
    description: 'Boost confidence, clarity & career',
    bgColor: 'bg-gradient-to-br from-green-500 to-teal-600',
    textColor: 'text-white'
  },
  {
    id: 3,
    icon: '📊',
    title: 'Excel & Workplace Tools',
    subtitle: 'Excel mastery at your fingertips',
    description: 'Data, dashboards & daily productivity',
    bgColor: 'bg-gradient-to-br from-orange-500 to-red-600',
    textColor: 'text-white'
  },
  {
    id: 4,
    icon: '🧠',
    title: 'Data Science & AI',
    subtitle: 'From zero to AI hero',
    description: 'Data science, ML & real-world AI tools',
    bgColor: 'bg-gradient-to-br from-purple-500 to-pink-600',
    textColor: 'text-white'
  },
  {
    id: 5,
    icon: '🎯',
    title: 'Campus Placement Training',
    subtitle: 'Get placement-ready in 4 weeks',
    description: 'Aptitude, interviews, and soft skills',
    bgColor: 'bg-gradient-to-br from-indigo-500 to-blue-600',
    textColor: 'text-white'
  },
  {
    id: 6,
    icon: '📈',
    title: 'Digital Marketing Training',
    subtitle: 'Advertise smart, grow faster',
    description: 'SEO, Ads, Analytics & growth skills',
    bgColor: 'bg-gradient-to-br from-yellow-500 to-orange-600',
    textColor: 'text-white'
  },
  {
    id: 7,
    icon: '🧾',
    title: 'Finance for Non-Finance',
    subtitle: 'Decode numbers with ease',
    description: 'Practical finance for everyday pros',
    bgColor: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    textColor: 'text-white'
  }
];

const ServiceSlider = () => {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Explore Our Training Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional training programs designed to boost your career and skills
          </p>
        </div>

        <Carousel className="w-full max-w-7xl mx-auto">
          <CarouselContent className="-ml-4">
            {services.map((service) => (
              <CarouselItem key={service.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className={`${service.bgColor} rounded-xl p-8 h-80 flex flex-col justify-between relative overflow-hidden`}>
                  {/* Background pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                    <div className="text-6xl">{service.icon}</div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="text-4xl mb-4">{service.icon}</div>
                    <h3 className={`text-xl font-bold mb-2 ${service.textColor}`}>
                      {service.title}
                    </h3>
                    <p className={`text-lg font-medium mb-3 ${service.textColor} opacity-90`}>
                      {service.subtitle}
                    </p>
                    <p className={`text-sm mb-6 ${service.textColor} opacity-80`}>
                      {service.description}
                    </p>
                  </div>
                  
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="self-start bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                  >
                    Book now
                  </Button>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </div>
    </section>
  );
};

export default ServiceSlider;