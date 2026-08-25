# Overview

Reuben's solution to the interview project. The project skeleton was generated using the NestJS `nest` cli, hence quite a bit of chaff around eslint/prettier and the tsconfig. `pnpm` is my package manager of choice as I usually work in a monorepo, but an `npm` install should still work, though it'll generate a new lockfile.

#### AI Usage

Development was done by me with no AI tooling, with an AI-assisted cleanup review.

#### Running the server

POST requests on `/applications` endpoint, expecting a request body like

```ts
{
  candidateId: "", // Must be a valid UUID
  schemeId: "" // Must be a valid UUID
}
```

`pnpm start` to run the server, `pnpm start:dev` to run with watch.

#### Tests

Uses Jest to run e2e tests on the applications controller. Tests themselves are defined using a schema rather than imperatively typing out each one.

Run the tests with

`pnpm test`

## Product Questions

_**Who is the primary user of this endpoint, and who else might call it later?**_

The primary user of the `/applications` endpoint would be a candidate trying to make an application to a scheme. Later it might also be used by whomever manages applications to accept/reject applications, or otherwise modify an application status, which feeds into my product decision. Managers might also be separate from whomever would actually evaluate those applications, i.e. you might have one person who is able to accept/reject applications, but multiple other non managerial users that could view and add comment to them. Then you'd consider how to separate the permissions, e.g. Managers can accept/reject/modify all fields of the application, Evaluators can only modify a set of fields assigned to them (a hypothetical Comments field for example.)

_**One product decision you made that is not in the rules above (and why).**_

Only users of a type "Candidate" can make applications. Besides thinking about how the user system would be structured, you wouldn't want non Candidate (think student) from being able to make applications for a few reasons:

- Allowing those who manage applications to also make applications could lead to some nefarious behaviour around rejecting other/accepting their own application.
- This guards against frontend bugs in the case of a non Candidate accidentally calling the endpoint when attempting to get or modify the application.

_**Two things you would not ship in v1, and why.**_

1. Generalised custom error harness. At the moment if there were another controller it would define its own error shape and language. Eventually you'd want to centralise these somewhere to ensure things are being named consistently, minimuse reuse for shared messages (`CANDIDATE_NOT_FOUND` would be a prime example of that). Currently you wouldn't have a meaningful amount of data to create that abstraction, for example supporting translations or further properties. You can't abstract from one example.
2. You could recommend similar schemes to the applicant based on their application responses, e.g. based on location or skillset. Reason not to ship it would be that it's hard to make a good recommendation engine so it's not the sort of thing you want to feature-creep in, and that even though you have the data at the point of application to make recommendations, returning those recommendations in the response or having side effects off this endpoint wouldn't be the way to do it.

_**What you would measure to know this is working (1-3 signals).**_

- API call volume for the endpoint, with a breakdown by return code (a preponderance of fails would show something is probably wrong).
- Latency rates, always somethign to monitor overtime as the endpoint expands in complexity with new features.
- Cummulative call cost, e.g. cost per 1000 calls, probably against something like total number of calls. You'd expect cost to go up with the number of calls, but if cost increases despite flat usage then you'd need to look into why.
