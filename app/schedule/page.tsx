'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CalendarDays, Clock, Plus, Loader2 } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
}

export default function SchedulePage() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendarEvents = async () => {
    if (!session?.accessToken) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/calendar/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchCalendarEvents();
    }
  }, [session?.accessToken]);

  const handleConnectGoogleCalendar = () => {
    signIn('google');
  };

  const handleDisconnectGoogleCalendar = () => {
    signOut();
  };

  const handleAddEvent = () => {
    // TODO: Implement add event functionality
    console.log('Adding new event...');
  };

  const formatEventTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatEventDate = (dateTime: string) => {
    const date = new Date(dateTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

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
          {!session ? (
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
                <span className="font-medium">Connected as {session.user?.email}</span>
              </div>
              <Button 
                variant="outline" 
                onClick={handleDisconnectGoogleCalendar}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Disconnect
              </Button>
              <Button 
                variant="outline" 
                onClick={fetchCalendarEvents}
                disabled={loading}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Refresh Events'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

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
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : session ? (
                  <div className="text-center text-gray-500 py-8">
                    <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Calendar View</p>
                    <p className="text-sm">
                      {events.length > 0 
                        ? `${events.length} events loaded from Google Calendar`
                        : "No upcoming events found"
                      }
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Calendar View</p>
                    <p className="text-sm">
                      Connect your Google Calendar to see your events
                    </p>
                  </div>
                )}
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
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : events.length > 0 ? (
                  events.map((event) => (
                    <div 
                      key={event.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <p className="text-sm text-gray-600">
                            {formatEventTime(event.start)} - {formatEventTime(event.end)}
                          </p>
                          <p className="text-xs text-gray-500">{formatEventDate(event.start)}</p>
                          {event.location && (
                            <p className="text-xs text-gray-500 mt-1">📍 {event.location}</p>
                          )}
                        </div>
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">
                      {session ? 'No upcoming events' : 'Connect to see events'}
                    </p>
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