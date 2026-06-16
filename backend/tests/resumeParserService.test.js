const { extractSections, extractSkills } = require('../src/services/resumeParserService');

describe('resumeParserService', () => {
  it('extracts skills and common sections from text', () => {
    const text = `Summary\nFull stack developer\n\nSkills\nJavaScript, React, Node.js\n\nExperience\nBuilt APIs`;
    const sections = extractSections(text);
    const skills = extractSkills(text);

    expect(sections.summary).toContain('Full stack developer');
    expect(sections.skills).toContain('JavaScript');
    expect(skills).toEqual(expect.arrayContaining(['javascript', 'react', 'node.js']));
  });
});
