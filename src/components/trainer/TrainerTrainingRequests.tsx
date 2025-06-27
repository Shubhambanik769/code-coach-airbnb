
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TrainingRequestsFeed from '@/components/training/TrainingRequestsFeed';
import TrainerApplications from '@/components/training/TrainerApplications';
import TrainerRequestHistory from '@/components/training/TrainerRequestHistory';

const TrainerTrainingRequests = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Training Requests</h2>
        <p className="text-gray-600">Browse available training requests, track your applications, and view your history</p>
      </div>
      
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Available Requests</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
          <TabsTrigger value="history">Request History</TabsTrigger>
        </TabsList>
        <TabsContent value="available" className="space-y-4">
          <TrainingRequestsFeed />
        </TabsContent>
        <TabsContent value="applications" className="space-y-4">
          <TrainerApplications />
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <TrainerRequestHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainerTrainingRequests;
