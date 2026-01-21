
import React from 'react';

export interface RouteSuggestion {
  from: string;
  to: string;
  explanation: string;
  links: Array<{ title: string; uri: string }>;
}

export interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}