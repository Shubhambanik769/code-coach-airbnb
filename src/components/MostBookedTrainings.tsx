
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Star, Clock, Users, Award } from 'lucide-react';

const mostBookedTrainings = [
  {
    id: 1,
    title: 'React & Modern JavaScript',
    trainer: 'Sarah Johnson',
    rating: 4.9,
    reviews: 127,
    students: 350,
    duration: '40 hours',
    price: 899,
    image: '/placeholder.svg',
    tags: ['React', 'JavaScript', 'Frontend'],
    bgGradient: 'bg-gradient-to-br from-blue-500 to-cyan-600'
  },
  {
    id: 2,
    title: 'Python for Data Science',
    trainer: 'Dr. Michael Chen',
    rating: 4.8,
    reviews: 94,
    students: 280,
    duration: '35 hours',
    price: 799,
    image: '/placeholder.svg',
    tags: ['Python', 'Data Science', 'Analytics'],
    bgGradient: 'bg-gradient-to-br from-green-500 to-emerald-600'
  },
  {
    id: 3,
    title: 'Digital Marketing Mastery',
    trainer: 'Emma Rodriguez',
    rating: 4.9,
    reviews: 156,
    students: 420,
    duration: '30 hours',
    price: 699,
    image: '/placeholder.svg',
    tags: ['Marketing', 'SEO', 'Social Media'],
    bgGradient: 'bg-gradient-to-br from-purple-500 to-pink-600'
  },
  {
    id: 4,
    title: 'Advanced Excel & Analytics',
    trainer: 'James Wilson',
    rating: 4.7,
    reviews: 88,
    students: 190,
    duration: '25 hours',
    price: 549,
    image: '/placeholder.svg',
    tags: ['Excel', 'Analytics', 'Business'],
    bgGradient: 'bg-gradient-to-br from-orange-500 to-red-600'
  },
  {
    id: 5,
    title: 'Machine Learning Fundamentals',
    trainer: 'Dr. Priya Sharma',
    rating: 4.8,
    reviews: 102,
    students: 245,
    duration: '45 hours',
    price: 999,
    image: '/placeholder.svg',
    tags: ['AI/ML', 'Python', 'Statistics'],
    bgGradient: 'bg-gradient-to-br from-indigo-500 to-purple-600'
  },
  {
    id: 6,
    title: 'Public Speaking & Leadership',
    trainer: 'Robert Thompson',
    rating: 4.9,
    reviews: 134,
    students: 310,
    duration: '20 hours',
    price: 449,
    image: '/placeholder.svg',
    tags: ['Soft Skills', 'Leadership', 'Communication'],
    bgGradient: 'bg-gradient-to-br from-teal-500 to-cyan-600'
  }
];

const MostBookedTrainings = () => {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Most Booked Trainings
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of professionals who chose these top-rated training programs
          </p>
        </div>

        <Carousel className="w-full max-w-7xl mx-auto">
          <CarouselContent className="-ml-4">
            {mostBookedTrainings.map((training) => (
              <CarouselItem key={training.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="bg-card rounded-2xl p-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-border">
                  {/* Header with gradient background */}
                  <div className={`${training.bgGradient} rounded-xl p-4 mb-4 text-white relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
                    <div className="relative z-10">
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">
                        {training.title}
                      </h3>
                      <p className="text-white/90 font-medium">
                        by {training.trainer}
                      </p>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{training.rating}</span>
                      <span className="text-muted-foreground">({training.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{training.students}</span>
                    </div>
                  </div>

                  {/* Duration and Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{training.duration}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-foreground">
                        ${training.price}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {training.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    Book Training
                  </Button>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 bg-background/80 border-border hover:bg-background shadow-md" />
          <CarouselNext className="right-4 bg-background/80 border-border hover:bg-background shadow-md" />
        </Carousel>
      </div>
    </section>
  );
};

export default MostBookedTrainings;
