# Konflux


Firebase realtime database data model:
```json
{
    "events": {
        "COMP4128 Group Study": {
            id: "comp4128-group-study-13ad",
            earliest: "9:00AM",
            latest: "5:00PM",
            days: [
                {
                    date: "2022-08-20",
                    // Array of 48 integers denoting how many responders are
                    // available at a certain 30-min time block, ordered from
                    // 00:00 to 23:59.
                    filledTimes: [
                        0,
                        0,
                        1,
                        2,
                        0,
                        1,
                        // ... and so on.
                    ]
                },
                // ... and so on for further dates.
            ],
            members: {
                "Andrew Taylor": {
                    password: "...",            // Optional. Only for this event.
                    email: "andrew@taylor.com", // Optional. Only for registered members.
                    profilePicUrl: "...",       // Optional. Only for registerd members.
                },
                // ...
            }
        },
        "Dinner with Linus Torvalds": {
            // ...
        }
    }
}
```

