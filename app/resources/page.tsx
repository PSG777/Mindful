'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  Video, 
  Phone, 
  Heart, 
  Brain, 
  Users, 
  Shield, 
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Resources', icon: BookOpen },
    { id: 'crisis', name: 'Crisis Support', icon: Phone },
    { id: 'anxiety', name: 'Anxiety & Stress', icon: Brain },
    { id: 'depression', name: 'Depression', icon: Heart },
    { id: 'relationships', name: 'Relationships', icon: Users },
    { id: 'self-care', name: 'Self-Care', icon: Shield },
  ];

  const resources = [
    // Crisis Support
    {
      id: 1,
      title: 'National Suicide Prevention Lifeline',
      description: '24/7 free and confidential support for people in distress',
      type: 'crisis',
      category: 'crisis',
      url: 'https://988lifeline.org/',
      phone: '988',
      isHotline: true,
      icon: Phone
    },
    {
      id: 2,
      title: 'Crisis Text Line',
      description: 'Text HOME to 741741 to connect with a Crisis Counselor',
      type: 'crisis',
      category: 'crisis',
      url: 'https://www.crisistextline.org/',
      phone: '741741',
      isHotline: true,
      icon: Phone
    },
    {
      id: 3,
      title: 'Veterans Crisis Line',
      description: 'Confidential support for veterans and their families',
      type: 'crisis',
      category: 'crisis',
      url: 'https://www.veteranscrisisline.net/',
      phone: '988',
      isHotline: true,
      icon: Phone
    },

    // Anxiety & Stress
    {
      id: 4,
      title: 'Understanding Anxiety Disorders',
      description: 'Comprehensive guide to anxiety from the National Institute of Mental Health',
      type: 'article',
      category: 'anxiety',
      url: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders',
      source: 'NIMH',
      icon: BookOpen
    },
    {
      id: 5,
      title: '5-4-3-2-1 Grounding Technique',
      description: 'Simple mindfulness exercise to reduce anxiety and stress',
      type: 'video',
      category: 'anxiety',
      url: 'https://www.youtube.com/watch?v=O29e4rRMrV4',
      source: 'YouTube',
      icon: Video
    },
    {
      id: 6,
      title: 'Progressive Muscle Relaxation',
      description: 'Step-by-step guide to physical relaxation techniques',
      type: 'article',
      category: 'anxiety',
      url: 'https://www.healthline.com/health/progressive-muscle-relaxation',
      source: 'Healthline',
      icon: BookOpen
    },

    // Depression
    {
      id: 7,
      title: 'Depression: What You Need to Know',
      description: 'Evidence-based information about depression and treatment options',
      type: 'article',
      category: 'depression',
      url: 'https://www.nimh.nih.gov/health/publications/depression',
      source: 'NIMH',
      icon: BookOpen
    },
    {
      id: 8,
      title: 'Cognitive Behavioral Therapy for Depression',
      description: 'How CBT can help manage depressive thoughts and behaviors',
      type: 'video',
      category: 'depression',
      url: 'https://www.youtube.com/watch?v=8jPQjjsBbIc',
      source: 'YouTube',
      icon: Video
    },
    {
      id: 9,
      title: 'Exercise and Depression',
      description: 'The science behind exercise as a treatment for depression',
      type: 'article',
      category: 'depression',
      url: 'https://www.health.harvard.edu/mind-and-mood/exercise-is-an-all-natural-treatment-to-fight-depression',
      source: 'Harvard Health',
      icon: BookOpen
    },

    // Relationships
    {
      id: 10,
      title: 'Healthy Communication in Relationships',
      description: 'Tips for improving communication with partners, family, and friends',
      type: 'article',
      category: 'relationships',
      url: 'https://www.psychologytoday.com/us/blog/communication-success/201311/10-keys-effective-communication',
      source: 'Psychology Today',
      icon: BookOpen
    },
    {
      id: 11,
      title: 'Setting Boundaries',
      description: 'How to establish and maintain healthy boundaries in relationships',
      type: 'video',
      category: 'relationships',
      url: 'https://www.youtube.com/watch?v=rtsHUeKnk_I',
      source: 'YouTube',
      icon: Video
    },
    {
      id: 12,
      title: 'Family Therapy Resources',
      description: 'Information about family therapy and when it might be helpful',
      type: 'article',
      category: 'relationships',
      url: 'https://www.aamft.org/Consumer_Updates/Family_Therapy.aspx',
      source: 'AAMFT',
      icon: BookOpen
    },

    // Self-Care
    {
      id: 13,
      title: 'Self-Care Starter Kit',
      description: 'Practical self-care strategies for mental health and wellness',
      type: 'article',
      category: 'self-care',
      url: 'https://www.psychiatry.org/patients-families/self-care',
      source: 'American Psychiatric Association',
      icon: BookOpen
    },
    {
      id: 14,
      title: 'Mindfulness Meditation Guide',
      description: 'Beginner-friendly guide to mindfulness meditation',
      type: 'video',
      category: 'self-care',
      url: 'https://www.youtube.com/watch?v=inpok4MKVLM',
      source: 'YouTube',
      icon: Video
    },
    {
      id: 15,
      title: 'Sleep Hygiene Tips',
      description: 'Evidence-based strategies for better sleep and mental health',
      type: 'article',
      category: 'self-care',
      url: 'https://www.sleepfoundation.org/sleep-hygiene',
      source: 'Sleep Foundation',
      icon: BookOpen
    },
    {
      id: 16,
      title: 'Nutrition and Mental Health',
      description: 'How diet affects mood and mental well-being',
      type: 'article',
      category: 'self-care',
      url: 'https://www.health.harvard.edu/blog/nutritional-psychiatry-your-brain-on-food-201511168626',
      source: 'Harvard Health',
      icon: BookOpen
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mental Health Resources</h1>
        <p className="text-gray-600">Trusted information, tools, and support for your mental health journey</p>
      </div>

      {/* Crisis Support Banner */}
      <Card className="mb-6 border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Phone className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Need immediate help?</h3>
                <p className="text-red-700 text-sm">Call 988 for the National Suicide Prevention Lifeline</p>
              </div>
            </div>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => window.open('https://988lifeline.org/', '_blank')}
            >
              Get Help Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                <category.icon className="h-4 w-4 mr-2" />
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <resource.icon className="h-5 w-5" />
                {resource.title}
              </CardTitle>
              <CardDescription>
                {resource.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                    {resource.type}
                  </span>
                  {resource.source && (
                    <span className="font-medium">{resource.source}</span>
                  )}
                </div>
                {resource.isHotline && (
                  <div className="text-sm text-red-600 font-medium">
                    📞 Call: {resource.phone}
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(resource.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {resource.isHotline ? 'Call Now' : 'Learn More'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Disclaimer */}
      <Card className="mt-8 bg-gray-50">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600 text-center">
            <strong>Disclaimer:</strong> These resources are for informational purposes only and are not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers with questions you may have regarding medical conditions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 