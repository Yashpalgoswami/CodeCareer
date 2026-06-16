const { matchKeywords } = require('../src/services/matchingService');

describe('matchingService', () => {
  it('returns matched and missing skills with score', () => {
    const result = matchKeywords({
      resumeText: 'Experienced JavaScript and React developer',
      resumeSkills: ['Node.js', 'SQL'],
      repoNames: ['react-dashboard', 'node-api'],
      jobText: 'Looking for react node sql python',
    });

    expect(result.matched).toEqual(expect.arrayContaining(['react', 'node', 'sql']));
    expect(result.missing).toContain('python');
    expect(result.score).toBeGreaterThan(0);
  });
});
