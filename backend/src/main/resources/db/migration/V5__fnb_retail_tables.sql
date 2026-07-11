create table food_courts (
        created_at datetime(6),
        id bigint not null auto_increment,
        park_id bigint not null,
        code varchar(20) not null,
        name varchar(150) not null,
        status enum ('ACTIVE','CLOSED') not null,
        primary key (id)
    ) engine=InnoDB;

create table food_items (
        price decimal(15,2) not null,
        created_at datetime(6),
        food_stall_id bigint not null,
        id bigint not null auto_increment,
        name varchar(150) not null,
        status enum ('AVAILABLE','SEASONAL','UNAVAILABLE') not null,
        primary key (id)
    ) engine=InnoDB;

create table food_stalls (
        created_at datetime(6),
        food_court_id bigint not null,
        id bigint not null auto_increment,
        code varchar(20) not null,
        name varchar(150) not null,
        status enum ('ACTIVE','CLOSED','TEMPORARILY_CLOSED') not null,
        primary key (id)
    ) engine=InnoDB;

create table retail_items (
        price decimal(15,2) not null,
        stock_quantity integer not null,
        created_at datetime(6),
        id bigint not null auto_increment,
        retail_shop_id bigint not null,
        sku varchar(50) not null,
        name varchar(200) not null,
        status enum ('ACTIVE','DISCONTINUED','OUT_OF_STOCK') not null,
        primary key (id)
    ) engine=InnoDB;

create table retail_shops (
        created_at datetime(6),
        id bigint not null auto_increment,
        park_id bigint not null,
        code varchar(20) not null,
        name varchar(150) not null,
        status enum ('ACTIVE','CLOSED') not null,
        primary key (id)
    ) engine=InnoDB;

alter table food_courts 
       add constraint UKfiepyhtia7nn4xle0ef90fclw unique (code);

alter table food_stalls 
       add constraint UKoaby2cy2e4ivnjfqtvlvc5mdg unique (code);

alter table retail_items 
       add constraint UKgvo3luvp6772bxvou3sifj1ke unique (sku);

alter table retail_shops 
       add constraint UK6lw5krnte0tgrgnhj4x0pl4q3 unique (code);
