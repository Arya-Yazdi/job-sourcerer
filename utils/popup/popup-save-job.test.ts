import { onsiteData, remoteData } from './handshake-test-data.ts';
import {
  getHandshakeJobId,
  getJobSiteName,
  parseHandshakeJob,
} from './popup-utils.ts';
import { describe, expect, test } from 'vitest';

describe('getJobSiteName Tests', () => {
  test('handshake', () => {
    expect(
      getJobSiteName(
        'https://app.joinhandshake.com/job-search/10119675?page=1&per_page=25'
      )
    ).toBe('handshake');
  });
  test('linkedin', () => {
    expect(
      getJobSiteName(
        'https://www.linkedin.com/jobs/view/4325252246/?alternateChannel=search&eBP=CwEAAAGbdWOV8yO2WrYcm3q7ZQuLOmNTcJfACh64cmZYzf8VzvP0zjKfgPw-o7fJDoBmFibZrcP36UFxSCHrJMqp4XlytR3vZP-OSff47KczgUoKQa5jyYsfgr0tkIi3OIjdm-_g1azGpvvohNqgitHPkNVpKjB2LlOg4CklEed__rNwv2F49AAe1ijXl3Nv06FQ90hKUcMyBvGT57AyLUMV-M8jNvRqrQfL6KWY4bC5FXvLuyH_MbPdzmJiyInusjpuXuQKEzDx52LODlEHniRRPi8PZNhalBPxaMk1VYy_X-_Y8fJ6lbNTV85akmFFFC5jJdVh0ssJSV4YTz4FlqBTFYz5ofuY2ootxRNh9xFy_reMRImGZeIUdjpbGM7v_BWJJXBuvEZ9r9lJ1ZW5a2hMFTNp1Z2fGjUYQcRSj80F5tcWoeaQDaGiISWFKjmKInm3pXF9dslyNa_JlrsXwSLcNR8GdJLoWj_cy3-7R7L0OLniYXGjCuQBkf9jRqqxIE8&trk=d_flagship3_preload&refId=NmBoMI46s%2FOnckjXa242Ag%3D%3D&trackingId=VX0B128wC8nmdNbUjmr0qg%3D%3D'
      )
    ).toBe('linkedin');
  });

  test('null', () => {
    expect(getJobSiteName('https://google.com/')).toBeNull();
  });
});

describe('getHandshakeJobId Tests', () => {
  test('returns null when job id not in url', () => {
    expect(
      getHandshakeJobId('https://app.joinhandshake.com/inbox?filter=all')
    ).toBeNull();
  });
  test('returns job id when job id in url', () => {
    expect(
      getHandshakeJobId(
        'https://app.joinhandshake.com/job-search/10119675?page=1&per_page=25'
      )
    ).toBe(10119675);
    expect(
      getHandshakeJobId(
        'https://app.joinhandshake.com/job-search/9966672?page=1&per_page=25'
      )
    ).toBe(9966672);
    expect(
      getHandshakeJobId(
        'https://app.joinhandshake.com/jobs/10119675?searchId=f5b81e40-03c4-4062-940d-ff23ea45e145'
      )
    ).toBe(10119675);
  });
  test("returns null when a number other than a job id is in url aka doesn't return false positives", () => {
    // https://app.joinhandshake.com/stu/events/1428880
    expect(
      getHandshakeJobId('https://app.joinhandshake.com/stu/events/1428880')
    ).toBeNull();
    expect(
      getHandshakeJobId(
        'https://app.joinhandshake.com/stu/career_fairs/60565/jobs?page=1&per_page=12'
      )
    ).toBeNull();
  });
});

describe('parse handshake fetch', () => {
  test('parses data', () => {
    [remoteData, onsiteData].forEach((el) => {
      const pd = parseHandshakeJob(el);
      expect(pd).not.toBeNull();
      if (pd === null) return;

      expect(pd.closeOutDate).toStrictEqual(new Date(el.expirationDate));
      expect(pd.companyLogoUrl).toBe(el.employer.logo?.url ?? null);
      expect(pd.companyName).toBe(el.employer.name);
      expect(pd.datePosted).toStrictEqual(new Date(el.createdAt));
      expect(pd.description).toBe(el.description);
      expect(pd.employmentType).toBe(el.employmentType.name);
      expect(pd.intern).toBe(false);
      expect(pd.jobIdFromSite).toBe(`handshake-${el.id}`);
      expect(pd.link).toBe(`https://app.joinhandshake.com/jobs/${el.id}`);
      expect(pd.location).toBe(el.locations?.[0]?.name ?? 'remote');
      expect(pd.remote).toBe(el.remote);
      expect(pd.title).toBe(el.title);
      const testRate = Math.floor(
        (el.salaryRange.max + el.salaryRange.min) / 2
      );
      expect(pd.payrate).toBe(testRate);
      expect(pd.payType).toBe(el.salaryRange.paySchedule.name);
    });
  });

  test('invalid data throws error', () => {
    expect(() => parseHandshakeJob({})).toThrowError();
    expect(() => parseHandshakeJob('')).toThrowError();
    expect(() => parseHandshakeJob(1)).toThrowError();
    expect(() => parseHandshakeJob(1.4)).toThrowError();
  });
});
