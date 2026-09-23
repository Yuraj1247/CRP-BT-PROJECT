import React from 'react';
import AcademicTemplate from './AcademicTemplate';
import ModernMinimalTemplate from './ModernMinimalTemplate';
import GoldExecutiveTemplate from './GoldExecutiveTemplate';
import CreativeStudioTemplate from './CreativeStudioTemplate';
import CyberTechTemplate from './CyberTechTemplate';
import VintageHeritageTemplate from './VintageHeritageTemplate';

export const TEMPLATES_CONFIG = [
  {
    id: 'template-1',
    name: 'Classic Academic',
    category: 'Education & Honors',
    description: 'Traditional double border with ornate heraldic seal and formal typography.',
    badgeColor: 'bg-amber-100 text-amber-800'
  },
  {
    id: 'template-2',
    name: 'Modern Minimalist',
    category: 'Technology & Startups',
    description: 'Clean Swiss design with sharp cobalt blue accents and modern sans-serif fonts.',
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'template-3',
    name: 'Gold Executive',
    category: 'Corporate & Leadership',
    description: 'Prestigious navy and gold palette with ornate corner filigree and gilded seal.',
    badgeColor: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: 'template-4',
    name: 'Creative Studio',
    category: 'Design & Workshops',
    description: 'Vibrant emerald border with playful modern geometry and bold title typography.',
    badgeColor: 'bg-emerald-100 text-emerald-800'
  },
  {
    id: 'template-5',
    name: 'Cyber & Tech',
    category: 'Security & Blockchain',
    description: 'High-tech theme with visible SHA-256 hash snippets and cryptographic security badge.',
    badgeColor: 'bg-cyan-100 text-cyan-800'
  },
  {
    id: 'template-6',
    name: 'Vintage Heritage',
    category: 'Diplomas & Guilds',
    description: 'Warm ivory parchment finish with deep burgundy borders and antique seal styling.',
    badgeColor: 'bg-rose-100 text-rose-800'
  }
];

export default function CertificateRenderer({ templateId = 'template-1', data, innerRef }) {
  const renderTemplate = () => {
    switch (templateId) {
      case 'template-1':
        return <AcademicTemplate data={data} />;
      case 'template-2':
        return <ModernMinimalTemplate data={data} />;
      case 'template-3':
        return <GoldExecutiveTemplate data={data} />;
      case 'template-4':
        return <CreativeStudioTemplate data={data} />;
      case 'template-5':
        return <CyberTechTemplate data={data} />;
      case 'template-6':
        return <VintageHeritageTemplate data={data} />;
      default:
        return <AcademicTemplate data={data} />;
    }
  };

  return (
    <div
      ref={innerRef}
      className="cert-canvas-container mx-auto overflow-hidden rounded-md transition-all duration-200"
    >
      {renderTemplate()}
    </div>
  );
}
