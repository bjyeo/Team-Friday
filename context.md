## Context
For university and polytechnic students in Singapore who study outside home because home is not conducive to concentration. Their pain: they search on Google Maps, travel 20 minutes, and arrive to find every seat taken, or the place is stuffy, noisy or has no power sockets. They then either go home or buy a drink to justify sitting somewhere they can't really work. Ventilation matters more than most filters because of the climate. It is worst during exam season, when every study minute is precious, but it happens all year.

## Problem
Students who want to find a public study spot cannot see, before they travel, whether that spot has a free seat now, how crowded it is, how well ventilated it is, or whether it has power sockets and air conditioning. They only find out on arrival, then lose the time they had set aside for deep work.

## What success looks like
Primary outcome metric: the time from opening the site to choosing a spot, measured in the app.
Baseline: the canvas does not give one. Before building, time five students doing the same task on Google Maps and note the median.
Target: 8 of 10 test students choose a spot in under 2 minutes without opening Google Maps.
Guardrail: freshness must not get worse. No more than 1 in 5 spot cards may show information older than 3 hours; stale cards must be visibly labelled or hidden.
Note: the adoption rate across schools in the canvas is a year-long business measure, not something this build can move. Don't instrument it now.

## First version
The riskiest assumption is that students will pick and travel to a public spot using this instead of Google Maps, or instead of giving up and going home. The cheapest test is a small hand-seeded set of spots (say 10 to 15 around one or two campuses) where crowd and seat information comes from students tapping a quick report on arrival. How that data gets in is not settled in the canvas; the hackathon is partly testing whether self-reporting is enough.

As a student, I want to browse or search public study spots near my current location or near a place I type, so that I can see options without opening Google Maps.
As a student, I want each spot to show seat availability and crowd level with how long ago it was reported, so that I can judge whether the trip is worth it.
As a student, I want to filter by air conditioning, power sockets, noise level and opening hours including 24/7, so that only suitable spots remain.
As a student, I want to tap one button on arrival to report how full the place is, so that the next student gets fresh information.
As a student, I want to open the spot's location in my usual maps app, so that I can walk there without retyping the address.

## The first two minutes
It is the week before exams. A student is in the library queue that isn't moving, and opens the site on their phone. The page asks for their location or lets them type one. They see a short list of nearby spots, each with a crowd level, a seat count and a "reported 14 min ago" line. They tap the aircon and power filters. Two spots remain. They open the first, see "quiet, seats free, power along the wall", tap to open it in Maps, and start walking. When they arrive they tap "how full is it now" and answer in one tap.

## When things go wrong
Location permission is denied, so fall back to a text box for area or postcode. No spots within range, so widen the radius and say clearly that it did. Every report for a spot is stale, so show the spot but mark it as unconfirmed rather than pretending it is fresh. A spot has no reports at all, so show it without a crowd level and say so. The report button fails to send, so keep the answer locally and retry, and tell the student it wasn't saved. A spot is closed or full at arrival, so let them report "no seats" in one tap, which updates the card for everyone.

## Out of scope for now
No accounts, logins or profiles. No sensor or real-time crowd data. No bookings or seat reservations. No friend coordination or study groups. No reviews, photos, ratings or gamification. No native app, no push notifications. No data beyond the seeded spots.

## Technical notes
Start by proposing a plan and a file structure; wait for my go-ahead; build in small steps and commit as you go; write tests for the core logic.