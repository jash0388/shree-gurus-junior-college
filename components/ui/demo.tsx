'use client';

import React from 'react';
import { FlowButton } from './flow-button';

export const FlowButtonDemo = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 gap-4 flex-wrap">
      <FlowButton text="Admission Enquiry" />
      <FlowButton text="Submit Application" />
      <FlowButton text="Explore Courses" />
    </div>
  );
};

export default { FlowButtonDemo };
