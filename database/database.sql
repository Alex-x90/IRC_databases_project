-- drop tables if they exist
SET FOREIGN_KEY_CHECKS = 0;
drop table if exists users;
drop table if exists rooms;
drop table if exists messages;
drop table if exists friends;
SET FOREIGN_KEY_CHECKS = 1;

create table users (
  id int(11) auto_increment not null primary key,
  username varchar(255) not null,
  email varchar(320) not null,
  password char(64) not NULL    -- constant length since hashed strings are constant length
);

create table rooms(
  id int(11) auto_increment not null primary key,
  name varchar(255) not null,
  creationDate date not null
);

create table messages(
  id int(11) auto_increment not null primary key,
  message varchar(1000),
  userID int(11) not null,
  foreign key (userID) references users(id),
  roomID int(11) not null,
  foreign key (roomID) references rooms(id) on delete cascade,  -- when a room is deleted, delete message in it
  timestamp datetime not null
);

create table friends(
  userID1 int(11) not null,
  foreign key (userID1) references users(id),
  userID2 int(11) not null,
  foreign key (userID2) references users(id),
  roomID int(11) not null,
  foreign key (roomID) references rooms(id) on delete cascade,
  -- when room is deleted, delete friend relation (rooms can't normally be deleted except by removing a friend)
  constraint pk primary key (userID1, userID2),
  check (userID1 < userID2)
  -- make it so there can only be 1 unique permutation of any 2 userIDs (eg: without this both 2,5 and 5,2 would be valid, with this only 2,5 is valid)
);

-- create example users
insert into users (username, email, password) values ("mynamejeff", "JefferyJ@gmail.com", "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08");
insert into users (username, email, password) values ("alex_x90", "sashar@gmail.com", "5db85981430418e91d57ce134a47bdd9d489b603e0413abe18e19c1609e3a298");
insert into users (username, email, password) values ("lolE", "akaiji@gmail.com", "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb");
insert into users (username, email, password) values ("8762", "memeturtle@gmail.com", "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8");

-- create example rooms
insert into rooms (name, creationDate) values ("Databases", "2022-03-29");
insert into rooms (name, creationDate) values ("Private message", "2022-05-01");
insert into rooms (name, creationDate) values ("Private message", "2022-05-05");

-- create example messages, IDs are hardcoded since they're known
insert into messages (message, userID, roomID, timestamp) values ("Databases is a great class!", 1, 1, now());
insert into messages (message, userID, roomID, timestamp) values ("It is only game, why you have to be mad.", 4, 2, now());
insert into messages (message, userID, roomID, timestamp) values ("E", 2, 3, now());

-- create example friend relationships, IDs are hardcoded since they're known
insert into friends (userID1, userID2, roomID) values (3,4,2);
insert into friends (userID1, userID2, roomID) values (2,4,3);

-- describe all tables
describe users;
describe rooms;
describe messages;
describe friends;

-- show data from all tables
select * from users;
select * from rooms;
select * from messages;
select * from friends;
