# Konflux

[View the Figma prototype](https://www.figma.com/file/E6o0Sv89AQKycuUQGApd7L/Konflux?node-id=0%3A1)

Firebase realtime database data model:
```json
{
    "events": {
        "comp4128-group-study-134ca1": {
            name: "COMP4128 Group Study",
            earliest: "9:00AM",
            latest: "5:00PM",
            timeIntervals [
                [
                    {
                        date: "2022-08-20",
                        // Array of 48 integers denoting how many responders are
                        // available at a certain 30-min time block, ordered from
                        // 00:00 to 23:59.
                        whoIsAvailable: [
                            [],                 // 12:00AM
                            [],                 // 12:30AM
                            ["Alice"],          // 1:00AM
                            ["Alice", "Bob"],   // 1:30AM
                            [],                 // 2:00AM
                            ["Bob"],            // 2:30AM
                            // ... and so on.
                        ]
                    },
                    // ... and so on for further dates.
                ]
            ],
            members: {
                "Alice": {
                    password: "...",            // Optional. Only for this event.
                    email: "alice@gmail.com",   // Optional. Only for registered members.
                    profilePicUrl: "...",       // Optional. Only for registerd members.
                },
                "Bob": {
                }
                // ...
            }
        },
        "Dinner with Linus Torvalds": {
            // ...
        }
    },
}
```

