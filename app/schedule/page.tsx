'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

  // Fetch events from your API route
  const fetchCalendarEvents = async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/calendar/events');
      if (!res.ok) throw new Error('Failed to fetch events');
      const json = await res.json();
      setEvents(json.events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // When we have a session (i.e. signed in), load events
  useEffect(() => {
    if (session?.accessToken) fetchCalendarEvents();
  }, [session?.accessToken]);

  // Helpers for formatting
  const formatEventTime = (dt: string) =>
    new Date(dt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  const formatEventDate = (dt: string) => {
    const date = new Date(dt);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Loading spinner while session is loading
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
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Schedule</h1>
        <p className="text-gray-600">
          Manage your appointments and wellness activities
        </p>
      </div>

      {/* Google Calendar Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Integration
          </CardTitle>
          <CardDescription>
            {session
              ? `Connected as ${session.user?.email}`
              : 'Connect your Google Calendar to sync events'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!session ? (
            <Button
              onClick={() => signIn('google')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Connect Google Calendar
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => signOut()}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Disconnect
              </Button>
              <Button
                variant="outline"
                onClick={fetchCalendarEvents}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Refresh Events'
                )}
              </Button>
            </div>
          )}
          {error && (
            <p className="mt-2 text-red-600">Error: {error}</p>
          )}
        </CardContent>
      </Card>

      {/* Calendar Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Big Calendar Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Calendar
                </div>
                <Button onClick={() => {/* TODO: hook up add-event */}}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px] bg-gray-50 rounded-lg p-8 flex flex-col items-center justify-center">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : !session ? (
                  <>
                    <CalendarDays className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500">
                      Connect your Google Calendar to see events
                    </p>
                  </>
                ) : events.length === 0 ? (
                  <>
                    <CalendarDays className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500">
                      No upcoming events in the next 7 days
                    </p>
                  </>
                ) : (
                  <p className="text-gray-700">
                    {events.length} event{events.length > 1 && 's'} loaded
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events List */}
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
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : events.length > 0 ? (
                  events.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 transition"
                    >
                      <h4 className="font-medium">{ev.title}</h4>
                      <p className="text-sm text-gray-600">
                        {formatEventTime(ev.start)} —{' '}
                        {formatEventTime(ev.end)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatEventDate(ev.start)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center">
                    {!session
                      ? 'Connect to see events'
                      : 'No upcoming events'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
