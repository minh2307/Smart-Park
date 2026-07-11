create table customers (
        birth_date date,
        created_at datetime(6),
        id bigint not null auto_increment,
        updated_at datetime(6),
        user_id bigint,
        phone varchar(20),
        full_name varchar(100),
        address varchar(200),
        gender enum ('FEMALE','MALE','OTHER'),
        status enum ('ACTIVE','INACTIVE') not null,
        primary key (id)
    ) engine=InnoDB;

create table membership_tiers (
        discount_percentage decimal(5,2),
        min_spend decimal(15,2),
        points_multiplier decimal(5,2),
        id bigint not null auto_increment,
        code varchar(20) not null,
        name varchar(50) not null,
        primary key (id)
    ) engine=InnoDB;

create table memberships (
        expiration_date date,
        join_date date not null,
        created_at datetime(6),
        customer_id bigint not null,
        id bigint not null auto_increment,
        points bigint not null,
        tier_id bigint not null,
        membership_code varchar(50) not null,
        status enum ('ACTIVE','EXPIRED','SUSPENDED') not null,
        primary key (id)
    ) engine=InnoDB;

create table point_histories (
        created_at datetime(6),
        id bigint not null auto_increment,
        membership_id bigint not null,
        order_id bigint,
        points_earned bigint not null,
        points_redeemed bigint not null,
        reason varchar(255),
        primary key (id)
    ) engine=InnoDB;

alter table customers 
       add constraint UKm3iom37efaxd5eucmxjqqcbe9 unique (phone);

alter table membership_tiers 
       add constraint UKcg8oc74khs2rp48v209p8aiij unique (code);

alter table memberships 
       add constraint UKp4p5m6oq6wj0pv5wvr9os0lmp unique (membership_code);
