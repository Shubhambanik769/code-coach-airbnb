
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ArrowRight, Clock, Zap, Gift } from 'lucide-react';

const offers = [
  {
    id: 1,
    badge: 'Up to ₹1,500 off',
    title: 'Premium Training Package',
    subtitle: 'React. Python. Digital Marketing. All-in-one.',
    buttonText: 'Claim Offer',
    bgGradient: 'bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900',
    image: '/placeholder.svg',
    validUntil: '48 hours left'
  },
  {
    id: 2,
    badge: 'Limited Time - 40% off',
    title: 'AI & Machine Learning',
    subtitle: 'Master the future. Start today. Expert-led.',
    buttonText: 'Enroll Now',
    bgGradient: 'bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900',
    image: '/placeholder.svg',
    validUntil: '24 hours left'
  },
  {
    id: 3,
    badge: 'Early Bird - 60% off',
    title: 'Full Stack Developer',
    subtitle: 'Frontend. Backend. Database. Complete package.',
    buttonText: 'Get Started',
    bgGradient: 'bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900',
    image: '/placeholder.svg',
    validUntil: '72 hours left'
  }
];

const OfferSlider = () => {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Limited Time Offers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't miss out on these exclusive deals. Save big on premium training programs.
          </p>
        </div>

        <Carousel className="w-full max-w-6xl mx-auto">
          <CarouselContent className="-ml-4">
            {offers.map((offer) => (
              <CarouselItem key={offer.id} className="pl-4">
                <div className={`${offer.bgGradient} rounded-2xl p-8 lg:p-12 h-80 relative overflow-hidden text-white`}>
                  {/* Background pattern overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20" />
                  
                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      {/* Badge */}
                      <div className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm mb-6">
                        <Gift className="w-4 h-4" />
                        {offer.badge}
                      </div>

                      {/* Title */}
                      <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                        {offer.title}
                      </h1>

                      {/* Subtitle */}
                      <p className="text-xl lg:text-2xl text-white/90 mb-6 font-medium">
                        {offer.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* CTA Button */}
                      <Button 
                        size="lg" 
                        className="bg-white text-black hover:bg-white/90 font-semibold px-8 py-3 rounded-full"
                      >
                        {offer.buttonText}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>

                      {/* Timer */}
                      <div className="flex items-center gap-2 text-white/80">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{offer.validUntil}</span>
                      </div>
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                  <div className="absolute bottom-4 right-8 w-24 h-24 bg-white/5 rounded-full blur-lg" />
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

export default OfferSlider;
