import React from 'react';

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  techStack: string[];
  metrics: string;
  stats?: {
    value: number;
    label: string;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    isLive?: boolean;
    trend?: 'up' | 'down' | 'neutral';
  };
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export enum SectionId {
  HERO = 'hero',
  ABOUT = 'about',
  TELEMETRY = 'telemetry',
  PROJECTS = 'projects',
  LAB = 'lab',
  SKILLS = 'skills',
  PROCESS = 'process',
  CONTACT = 'contact'
}