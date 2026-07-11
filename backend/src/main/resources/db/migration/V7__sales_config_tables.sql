create table coupon_usages (
        booking_id bigint,
        coupon_id bigint not null,
        customer_id bigint not null,
        id bigint not null auto_increment,
        used_at datetime(6),
        primary key (id)
    ) engine=InnoDB;

create table coupons (
        current_uses integer not null,
        discount_amount decimal(15,2) not null,
        max_uses integer not null,
        min_order_value decimal(15,2),
        id bigint not null auto_increment,
        promotion_id bigint not null,
        code varchar(50) not null,
        status enum ('ACTIVE','DISABLED','EXHAUSTED','EXPIRED') not null,
        primary key (id)
    ) engine=InnoDB;

create table payment_methods (
        id bigint not null auto_increment,
        code varchar(30) not null,
        name varchar(100) not null,
        provider varchar(100),
        status enum ('ACTIVE','INACTIVE') not null,
        primary key (id)
    ) engine=InnoDB;

create table promotions (
        end_date date not null,
        start_date date not null,
        `value` decimal(15,2) not null,
        created_at datetime(6),
        id bigint not null auto_increment,
        name varchar(150) not null,
        description TEXT,
        discount_type enum ('FIXED_AMOUNT','PERCENTAGE') not null,
        status enum ('ACTIVE','EXPIRED','INACTIVE') not null,
        primary key (id)
    ) engine=InnoDB;

create table ticket_pricings (
        date date not null,
        dynamic_price decimal(15,2) not null,
        created_at datetime(6),
        id bigint not null auto_increment,
        ticket_type_id bigint not null,
        override_reason varchar(200),
        primary key (id)
    ) engine=InnoDB;

create table ticket_types (
        available_quantity integer not null,
        max_price decimal(15,2),
        min_price decimal(15,2),
        standard_price decimal(15,2) not null,
        total_quantity integer not null,
        created_at datetime(6),
        id bigint not null auto_increment,
        park_id bigint not null,
        name varchar(100) not null,
        description TEXT,
        status enum ('ACTIVE','INACTIVE') not null,
        type enum ('ADULT','CHILD','DAILY','MONTHLY','VIP') not null,
        primary key (id)
    ) engine=InnoDB;

alter table coupons 
       add constraint UKeplt0kkm9yf2of2lnx6c1oy9b unique (code);

alter table payment_methods 
       add constraint UKm36ap4hf05m0uihe5ftw2omon unique (code);
