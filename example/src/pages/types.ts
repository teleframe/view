/**
 * @fileoverview Type definitions for example bot page views and templates
 * @module examples/src/pages/types
 */

import type { TopicCategory } from '../topics/types';

/**
 * Properties for the welcome StartPage
 */
export interface StartPageProps {
    userId: number;
    firstName: string;
    isForum?: boolean;
}

/**
 * Properties for the realistic User Profile showcase screen
 */
export interface ProfilePageProps {
    userId: number;
    firstName: string;
    username?: string;
    isVip?: boolean;
    joinedAt?: Date;
}

/**
 * Status and stage state for live animated progress bar task
 */
export interface LiveProgressPageProps {
    progress: number;
    stage: string;
    status: 'running' | 'completed' | 'cancelled';
    elapsedSeconds: number;
}

/**
 * Properties for topic hub intro screens
 */
export interface TopicHubPageProps {
    category: TopicCategory;
    topicName: string;
    description: string;
}
