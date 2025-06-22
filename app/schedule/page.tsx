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
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
}

const locales = {
  'en-US': enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

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

  // Convert events to react-big-calendar format
  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: new Date(event.start),
    end: new Date(event.end),
    allDay: !event.start.includes('T'),
    resource: event,
  }));

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
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendar
        </h1>
        <p className="text-gray-600">View your Google Calendar events</p>
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
              onClick={() => signIn('google')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Connect Google Calendar
            </Button>
          ) :
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
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Refresh Events'
                )}
              </Button>
            </div>
          }
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
      <div className="min-h-[500px] bg-white rounded-lg p-4 mb-8">
        <BigCalendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
        />
      </div>
    </div>
  );
}
