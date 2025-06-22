'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CalendarDays, Clock, Plus } from 'lucide-react';

export default function SchedulePage() {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Therapy Session',
      time: '10:00 AM - 11:00 AM',
      date: 'Today',
      type: 'therapy'
    },
    {
      id: 2,
      title: 'Mindfulness Practice',
      time: '2:00 PM - 2:30 PM',
      date: 'Tomorrow',
      type: 'wellness'
    }
  ]);

  const handleConnectGoogleCalendar = () => {
    // TODO: Implement Google Calendar OAuth
    setIsConnected(true);
    console.log('Connecting to Google Calendar...');
  };

  const handleDisconnectGoogleCalendar = () => {
    setIsConnected(false);
    console.log('Disconnecting from Google Calendar...');
  };

  const handleAddEvent = () => {
    // TODO: Implement add event functionality
    console.log('Adding new event...');
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule</h1>
        <p className="text-gray-600">Manage your appointments and wellness activities</p>
      </div>

      {/* Google Calendar Connection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Integration
          </CardTitle>
          <CardDescription>
            Connect your Google Calendar to sync appointments and wellness activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <Button 
              onClick={handleConnectGoogleCalendar}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Connect Google Calendar
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-600">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Connected to Google Calendar</span>
              </div>
              <Button 
                variant="outline" 
                onClick={handleDisconnectGoogleCalendar}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Disconnect
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendar Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Calendar
                </span>
                <Button onClick={handleAddEvent}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[400px] bg-gray-50 rounded-lg p-4">
                <div className="text-center text-gray-500 py-8">
                  <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Calendar View</p>
                  <p className="text-sm">
                    {isConnected 
                      ? "Your Google Calendar events will appear here"
                      : "Connect your Google Calendar to see your events"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => (
                  <div 
                    key={event.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-600">{event.time}</p>
                        <p className="text-xs text-gray-500">{event.date}</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        event.type === 'therapy' ? 'bg-blue-500' : 'bg-green-500'
                      }`} />
                    </div>
                  </div>
                ))}
                
                {events.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No upcoming events</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Plus className="h-5 w-5 mb-2" />
              <span>Add Therapy Session</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-5 w-5 mb-2" />
              <span>Schedule Wellness Activity</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Clock className="h-5 w-5 mb-2" />
              <span>Set Reminder</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 