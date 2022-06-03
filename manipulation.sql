-- Special character $ will be used to represent variables received from the backend programming

-- get other friend and roomID for each friendship a person has (somehow combined result to be sorted alphabetically)
select * from(
  select userID1 as userID, roomID from friends where userID2 = $myUserId
  union
  select userID2 as userID, roomID from friends where userID1 = $myUserId
)friends
inner join users on users.id = friends.userID;

-- remove a friend (should this also delete the corresponding room and mesages?)
delete from friends where (userID1 = $myUserId and userID2 = $notFriend) or (userID2 = $myUserId and userID1 = $notFriend);

-- get rooms
select id, name, DATE_FORMAT(creationDate,'%m-%d-%y') as creationDate from rooms order by id asc;

-- search for room by name
select name, creationDate from rooms where name like '%$searchString%' order by id asc;

-- search for user by name
select username from users where username like '%$searchString%' order by username asc;

-- get user by id
select username from users where id = $clickedUser;

-- delete a message
delete from messages where id = $messageID;

-- change password
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

-- get messages from room for specific scroll amount
select message, userID, timestamp from messages where (id between $startPageMsgId and $endPageMsgId) and roomID = $roomId
order by timestamp asc;

-- create a new account
insert into users (username, email, password) values ($username, $email, $hashedPassword);

-- add a friend
insert into rooms (name, creationDate) values ($newRoomName, now());
insert into friends (userID1, userID2, roomID) values ($myUserId, $friendUserId, LAST_INSERT_ID());

-- things to think about, what happens if a user is deleted? Can rooms be deleted? Can messages/rooms be edited?
