create table bookings (
        discount_amount decimal(15,2),
        total_amount decimal(15,2),
        created_at datetime(6),
        customer_id bigint not null,
        expires_at datetime(6),
        id bigint not null auto_increment,
        updated_at datetime(6),
        booking_code varchar(50) not null,
        coupon_code varchar(50),
        payment_status enum ('FAILED','PAID','PENDING','REFUNDED') not null,
        status enum ('CANCELLED','CHECKED_IN','COMPLETED','EXPIRED','PAID','PENDING') not null,
        primary key (id)
    ) engine=InnoDB;

create table order_items (
        quantity integer not null,
        total_price decimal(15,2) not null,
        unit_price decimal(15,2) not null,
        id bigint not null auto_increment,
        order_id bigint not null,
        reference_id bigint,
        item_type varchar(20) not null,
        primary key (id)
    ) engine=InnoDB;

create table orders (
        discount_amount decimal(15,2),
        subtotal decimal(15,2),
        tax_amount decimal(15,2),
        total_amount decimal(15,2) not null,
        booking_id bigint,
        created_at datetime(6),
        customer_id bigint not null,
        id bigint not null auto_increment,
        updated_at datetime(6),
        order_code varchar(50) not null,
        status enum ('CANCELLED','CONFIRMED','PAID','PENDING','REFUNDED') not null,
        primary key (id)
    ) engine=InnoDB;

create table payments (
        amount decimal(15,2) not null,
        id bigint not null auto_increment,
        order_id bigint not null,
        payment_method_id bigint not null,
        payment_time datetime(6),
        transaction_reference varchar(100),
        status enum ('CANCELLED','FAILED','PENDING','REFUNDED','SUCCESS') not null,
        primary key (id)
    ) engine=InnoDB;

create table refunds (
        amount decimal(15,2) not null,
        created_at datetime(6),
        id bigint not null auto_increment,
        payment_id bigint not null,
        updated_at datetime(6),
        reason varchar(255),
        status enum ('APPROVED','COMPLETED','PENDING','REJECTED') not null,
        primary key (id)
    ) engine=InnoDB;

alter table bookings 
       add constraint UKq97166k18hklq6ls46osbrftx unique (booking_code);

alter table orders 
       add constraint UKdhk2umg8ijjkg4njg6891trit unique (order_code);
