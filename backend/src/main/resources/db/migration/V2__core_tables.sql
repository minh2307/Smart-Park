create table parking_lots (
        occupied_spaces integer not null,
        total_spaces integer not null,
        created_at datetime(6),
        id bigint not null auto_increment,
        park_id bigint not null,
        name varchar(150) not null,
        status enum ('ACTIVE','CLOSED','FULL') not null,
        primary key (id)
    ) engine=InnoDB;

create table parks (
        close_time time(6),
        max_capacity integer,
        open_time time(6),
        created_at datetime(6),
        id bigint not null auto_increment,
        updated_at datetime(6),
        code varchar(20) not null,
        name varchar(150) not null,
        address varchar(300),
        description TEXT,
        status enum ('ACTIVE','CLOSED','MAINTENANCE') not null,
        primary key (id)
    ) engine=InnoDB;

create table zones (
        max_capacity integer,
        created_at datetime(6),
        id bigint not null auto_increment,
        park_id bigint not null,
        updated_at datetime(6),
        code varchar(20) not null,
        name varchar(100) not null,
        description TEXT,
        status enum ('ACTIVE','CLOSED') not null,
        primary key (id)
    ) engine=InnoDB;

alter table parks 
       add constraint UK2cabk1fcys8h1byaick9jphri unique (code);

alter table zones 
       add constraint UKdouujesh3vpm986wt5emv0d2y unique (code);
