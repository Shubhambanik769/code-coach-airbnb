import { Card, CardContent } from '@/components/ui/card';

interface SkeletonCardProps {
  className?: string;
}

const SkeletonCard = ({ className }: SkeletonCardProps) => {
  return (
    <Card className={className}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="skeleton w-16 h-16 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-5/6" />
        </div>
        <div className="flex gap-2">
          <div className="skeleton h-6 w-16 rounded-full" />
          <div className="skeleton h-6 w-20 rounded-full" />
          <div className="skeleton h-6 w-14 rounded-full" />
        </div>
        <div className="skeleton h-10 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
};

export default SkeletonCard;