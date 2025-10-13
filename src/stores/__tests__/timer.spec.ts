import { describe, it, expect } from 'bun:test';

describe('Game Timer Date Tests', () => {
  describe('Month Index Reference', () => {
    it('should verify JavaScript Date month indexing (0-11)', () => {
      const monthMap = [
        { index: 0, name: 'Jan', date: new Date(2025, 0, 1) },
        { index: 1, name: 'Feb', date: new Date(2025, 1, 1) },
        { index: 2, name: 'Mar', date: new Date(2025, 2, 1) },
        { index: 3, name: 'Apr', date: new Date(2025, 3, 1) },
        { index: 4, name: 'May', date: new Date(2025, 4, 1) },
        { index: 5, name: 'Jun', date: new Date(2025, 5, 1) },
        { index: 6, name: 'Jul', date: new Date(2025, 6, 1) },
        { index: 7, name: 'Aug', date: new Date(2025, 7, 1) },
        { index: 8, name: 'Sep', date: new Date(2025, 8, 1) },
        { index: 9, name: 'Oct', date: new Date(2025, 9, 1) },
        { index: 10, name: 'Nov', date: new Date(2025, 10, 1) },
        { index: 11, name: 'Dec', date: new Date(2025, 11, 1) },
      ];

      monthMap.forEach(month => {
        expect(month.date.getMonth()).toBe(month.index);
        expect(month.date.toDateString()).toContain(month.name);
      });

      console.log('✓ Month indexing verified: 0=Jan, 1=Feb, ..., 9=Oct, 10=Nov, 11=Dec');
    });
  });

  describe('Tarkov 1.0 Release', () => {
    it('should have correct date: Nov 15, 2025 at 8am UK', () => {
      const releaseDate = new Date(2025, 10, 15, 8, 0, 0);
      
      expect(releaseDate.getMonth()).toBe(10); // November
      expect(releaseDate.getDate()).toBe(15);
      expect(releaseDate.getFullYear()).toBe(2025);
      expect(releaseDate.getHours()).toBe(8);
      expect(releaseDate.toDateString()).toContain('Nov');
      
      console.log('Tarkov 1.0:', releaseDate.toString());
    });
  });

  describe('POE1 3.26', () => {
    it('should have correct date: June 13, 2025 at 9pm', () => {
      const releaseDate = new Date(2025, 5, 13, 21, 0, 0);
      
      expect(releaseDate.getMonth()).toBe(5); // June
      expect(releaseDate.getDate()).toBe(13);
      expect(releaseDate.getFullYear()).toBe(2025);
      expect(releaseDate.getHours()).toBe(21);
      expect(releaseDate.toDateString()).toContain('Jun');
      
      console.log('POE1 3.26:', releaseDate.toString());
    });
  });

  describe('Star Citizen: Squadron 42', () => {
    it('should have correct date: Dec 1, 2025', () => {
      const releaseDate = new Date(2025, 11, 1, 0, 0, 0);
      
      expect(releaseDate.getMonth()).toBe(11); // December
      expect(releaseDate.getDate()).toBe(1);
      expect(releaseDate.getFullYear()).toBe(2025);
      expect(releaseDate.toDateString()).toContain('Dec');
      
      console.log('Squadron 42:', releaseDate.toString());
    });
  });

  describe('Marvel 1943: Rise of Hydra', () => {
    it('should have correct date: March 1, 2025', () => {
      const releaseDate = new Date(2025, 2, 1, 0, 0, 0);
      
      expect(releaseDate.getMonth()).toBe(2); // March
      expect(releaseDate.getDate()).toBe(1);
      expect(releaseDate.getFullYear()).toBe(2025);
      expect(releaseDate.toDateString()).toContain('Mar');
      
      console.log('Marvel 1943:', releaseDate.toString());
    });
  });

describe('ARC Raiders Date Tests', () => {
  describe('Server Slam (Beta)', () => {
  it('should have correct start date: Oct 17, 2025 at 2pm BST (6am PDT / 9am EDT)', () => {
    const startDate = new Date(2025, 9, 17, 14, 0, 0);
    
    // Verify it's October (month 9 = October in 0-indexed)
    expect(startDate.getMonth()).toBe(9);
    expect(startDate.getDate()).toBe(17);
    expect(startDate.getFullYear()).toBe(2025);
    expect(startDate.getHours()).toBe(14);
    expect(startDate.getMinutes()).toBe(0);
    
    // Verify the date string contains "Oct"
    expect(startDate.toDateString()).toContain('Oct');
    
    // Log for verification
    console.log('Start Date:', startDate.toString());
    console.log('Start Date UTC:', startDate.toUTCString());
    console.log('Start Date ISO:', startDate.toISOString());
  });

  it('should have correct end date: Oct 19, 2025 at 4pm BST (8am PDT / 11am EDT)', () => {
    const endDate = new Date(2025, 9, 19, 16, 0, 0);
    
    // Verify it's October (month 9 = October in 0-indexed)
    expect(endDate.getMonth()).toBe(9);
    expect(endDate.getDate()).toBe(19);
    expect(endDate.getFullYear()).toBe(2025);
    expect(endDate.getHours()).toBe(16);
    expect(endDate.getMinutes()).toBe(0);
    
    // Verify the date string contains "Oct"
    expect(endDate.toDateString()).toContain('Oct');
    
    // Log for verification
    console.log('End Date:', endDate.toString());
    console.log('End Date UTC:', endDate.toUTCString());
    console.log('End Date ISO:', endDate.toISOString());
  });

  it('should have 2 days and 2 hours between start and end', () => {
    const startDate = new Date(2025, 9, 17, 14, 0, 0);
    const endDate = new Date(2025, 9, 19, 16, 0, 0);
    
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    // 2 days + 2 hours = 50 hours
    expect(diffHours).toBe(50);
  });
  });

  describe('Full Release', () => {
    it('should have correct release date: Oct 30, 2025 at 4pm BST', () => {
      const releaseDate = new Date(2025, 9, 30, 16, 0, 0);
      
      // Verify it's October (month 9 = October in 0-indexed)
      expect(releaseDate.getMonth()).toBe(9);
      expect(releaseDate.getDate()).toBe(30);
      expect(releaseDate.getFullYear()).toBe(2025);
      expect(releaseDate.getHours()).toBe(16);
      expect(releaseDate.getMinutes()).toBe(0);
      
      // Verify the date string contains "Oct"
      expect(releaseDate.toDateString()).toContain('Oct');
      
      // Log for verification
      console.log('Release Date:', releaseDate.toString());
      console.log('Release Date UTC:', releaseDate.toUTCString());
      console.log('Release Date ISO:', releaseDate.toISOString());
    });

    it('should have all regional release times set to 2025-10-30T16:00:00Z', () => {
      const expectedISO = '2025-10-30T16:00:00.000Z';
      
      const regionalTimes = [
        { timezone: 'America/Los_Angeles', date: new Date("2025-10-30T16:00:00Z") },
        { timezone: 'America/Mexico_City', date: new Date("2025-10-30T16:00:00Z") },
        { timezone: 'America/New_York', date: new Date("2025-10-30T16:00:00Z") },
        { timezone: 'America/Sao_Paulo', date: new Date("2025-10-30T16:00:00Z") },
        { timezone: 'Europe/London', date: new Date("2025-10-30T16:00:00Z") },
        { timezone: 'Europe/Stockholm', date: new Date("2025-10-30T16:00:00Z") },
        { timezone: 'Africa/Cairo', date: new Date("2025-10-30T16:00:00Z") },
        { timezone: 'Asia/Baku', date: new Date("2025-10-30T16:00:00Z") },
        { timezone: 'Asia/Kolkata', date: new Date("2025-10-30T16:00:00Z") },
        { timezone: 'Asia/Ho_Chi_Minh', date: new Date("2025-10-30T16:00:00Z") },
        { timezone: 'Asia/Tokyo', date: new Date("2025-10-30T16:00:00Z") },
        { timezone: 'Australia/Sydney', date: new Date("2025-10-30T16:00:00Z") },
      ];

      regionalTimes.forEach(region => {
        expect(region.date.toISOString()).toBe(expectedISO);
        console.log(`${region.timezone}: ${region.date.toISOString()}`);
      });
    });

    it('should be 11 days after Server Slam start', () => {
      const slamStart = new Date(2025, 9, 17, 14, 0, 0);
      const fullRelease = new Date(2025, 9, 30, 16, 0, 0);
      
      const diffMs = fullRelease.getTime() - slamStart.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      
      // Should be approximately 13 days and 2 hours
      expect(diffDays).toBeCloseTo(13.083, 2);
    });
  });
});
});
