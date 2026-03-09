# Social Wishlist Product Flow

## Actors
- Owner
- Guest
- System

## Owner Flow
1. Register / sign in
2. Create wishlist
3. Add gifts
4. Share public link

## Guest Flow
1. Open public link
2. Reserve gift
3. Contribute money
4. See realtime updates

## Privacy Rules
- Owner does not see who reserved
- Owner does not see who contributed

## Traceability
| Process | Route | UI | DB |
|---|---|---|---|
| Create wishlist | /wishlist/create | Create button | wishlists |
| Add gift | /wishlist/[id] | Add gift | gifts |
| Reserve gift | /w/[publicId] | Reserve | gifts/reservations |
| Contribute | /w/[publicId] | Contribute | contributions |