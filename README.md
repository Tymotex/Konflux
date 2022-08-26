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
            groupAvailabilities: {
                // Array of 48 integers denoting how many responders are
                // available at a certain 30-min time block, ordered from
                // 00:00 to 23:59.
                "2022-08-20": {
                    0: {},                         // 12:00AM.
                    1: {},                         // 12:30AM.
                    2: {"Alice": {}},              // 1:00AM.
                    3: {"Alice": {}, "Bob": {}},   // 1:30AM.
                    4: {},                         // 2:00AM.
                    5: {"Bob": {}},                // 2:30AM.
                    // ... and so on.
                }
                // ... and so on for further dates.
            },
            members: {
                "Alice": {
                    password?: "...",           // Only for this event.
                    email?: "alice@gmail.com",  // Only for registered members.
                    profilePicUrl?: "...",      // Only for registerd members.
                    isOwner?: true              // Only for the creator.
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
    users: {
        "Alice": {
            email?: "alice@gmail.com",
            profilePicUrl?: "...",
            // TODO: could either over-fetch data or introduce more redundancy in `events`.
            events: ["comp4128-group-study-134ca1", /* ... */]
        },
        // ...
    }
}
```

[Event page data flow diagram](https://lucid.app/lucidchart/ec76bcc5-6b82-4de8-961c-aa971d1c9a03/edit?invitationId=inv_ea7b2985-b5f6-4788-b2e7-e343cb63d7dd#)
