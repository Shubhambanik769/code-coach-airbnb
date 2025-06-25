
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import TrainingRequestForm from '@/components/training/TrainingRequestForm';
import ClientTrainingRequests from '@/components/training/ClientTrainingRequests';

const UserTrainingRequests = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Training Requests</h2>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Post Training Requirement</DialogTitle>
            </DialogHeader>
            <TrainingRequestForm onSuccess={() => setShowCreateForm(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <ClientTrainingRequests />
    </div>
  );
};

export default UserTrainingRequests;
