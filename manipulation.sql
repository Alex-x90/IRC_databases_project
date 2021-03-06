-- Special character $ will be used to represent variables received from the backend programming

-- get other friend and roomID for each friendship a person has
select * from(
  select userID1 as userID, roomID from friends where userID2 = $myUserId
  union
  select userID2 as userID, roomID from friends where userID1 = $myUserId
)friends
inner join users on users.id = friends.userID;  -- inner join users to get username

-- search friends list
select * from(
  select userID1 as userID, roomID from friends where userID2 = $myUserId
  union
  select userID2 as userID, roomID from friends where userID1 = $myUserId
)friends
inner join users on users.id = friends.userID and username like $username;  -- inner join users to get username when like searched name

-- remove a friend, cascades from deleting room to also delete friend relationship and messages in the room
-- $userID1 is min of $myUserId and $friendUserId, while $userID2 is max of those two IDs
delete from rooms where id = (select roomID from friends where userID1 = $userID1 and userID2 = $userID2);

-- get rooms (that aren't private messages)
select id, name, DATE_FORMAT(creationDate,'%m-%d-%y') as creationDate from rooms where name <> "Private message" order by id asc;

-- search for room by name (that aren't private messages)
select id, name, DATE_FORMAT(creationDate,'%m-%d-%y') as creationDate from rooms where name like '%$searchString%' and name <> "Private message" order by id asc;

-- search for user by name
select id, username from users where username like '%$searchString%' order by username asc;

-- get user by id
select id, username from users where id = $clickedUser;

-- delete a message
delete from messages where id = $messageID;

-- change password (not implemented)
update users set password = $newPassword
where id = $myUserId;

-- change email
update users set email = $newEmail
where id = $myUserId;

-- change username
update users set username = $newUsername
where id = $myUserId;

-- create a new room
insert into rooms (name, creationDate) values ($newRoomName, now());

-- send a message
insert into messages (message, userID, roomID, timestamp) values ($msg, $myUserId, $roomId, now());

-- get messages from room for specific scroll amount (this is an ideal, our implementation didn't end up using any special loading by specific scroll amount)
select message, userID, timestamp from messages where (id between $startPageMsgId and $endPageMsgId) and roomID = $roomID
order by timestamp asc;

-- actual select for getting messages
select name from rooms where id = ?;  -- grab room name to be displayed as well
select * from(select message, userID, timestamp from messages where roomID = $roomID) temp
inner join users on users.id = temp.userID  -- inner join users to get username
order by timestamp asc;

-- create a new account
insert into users (username, email, password) values ($username, $email, $hashedPassword);

-- add a friend
insert into rooms (name, creationDate) values ("Private message", now());
-- $userID1 is min of $myUserId and $friendUserId, while $userID2 is max of those two IDs
insert into friends (userID1, userID2, roomID) values ($userID1, $userID2, LAST_INSERT_ID());

-- things to think about, what happens if a user is deleted? Can rooms be deleted? Can messages/rooms be edited?
