create table analytics_events (
        amount decimal(15,2),
        retry_count integer not null,
        synced bit not null,
        created_at datetime(6),
        id bigint not null auto_increment,
        resource_id bigint,
        synced_at datetime(6),
        user_id bigint,
        event_id varchar(36) not null,
        resource_type varchar(50),
        error_message TEXT,
        metadata TEXT,
        event_type enum ('BOOKING_CANCELLED','BOOKING_CREATED','BOOKING_EXPIRED','CHECK_IN','COUPON_USED','MEMBERSHIP_UPGRADED','PAYMENT_COMPLETED','PAYMENT_FAILED','REFUND_ISSUED','RIDE_USED','TICKET_PURCHASED') not null,
        primary key (id)
    ) engine=InnoDB;

create table check_ins (
        check_time datetime(6) not null,
        id bigint not null auto_increment,
        ticket_id bigint not null,
        zone_id bigint,
        scanner_id varchar(50),
        primary key (id)
    ) engine=InnoDB;

create table feedbacks (
        rating integer not null,
        assigned_employee_id bigint,
        created_at datetime(6),
        customer_id bigint not null,
        id bigint not null auto_increment,
        content TEXT not null,
        category enum ('FACILITY','FOOD','OTHER','RIDE','SAFETY','STAFF') not null,
        status enum ('CLOSED','IN_REVIEW','OPEN','RESOLVED') not null,
        primary key (id)
    ) engine=InnoDB;

create table incidents (
        created_at datetime(6),
        id bigint not null auto_increment,
        reporter_id bigint not null,
        zone_id bigint not null,
        description TEXT not null,
        resolution_details TEXT,
        severity enum ('CRITICAL','HIGH','LOW','MEDIUM') not null,
        status enum ('CLOSED','INVESTIGATING','OPEN','RESOLVED') not null,
        primary key (id)
    ) engine=InnoDB;

create table notifications (
        created_at datetime(6),
        id bigint not null auto_increment,
        user_id bigint not null,
        title varchar(200) not null,
        content TEXT not null,
        status enum ('FAILED','PENDING','READ','SENT') not null,
        type enum ('EMAIL','IN_APP','PUSH','SMS') not null,
        primary key (id)
    ) engine=InnoDB;

create table parking_transactions (
        amount_paid decimal(15,2),
        entry_time datetime(6) not null,
        exit_time datetime(6),
        id bigint not null auto_increment,
        parking_lot_id bigint not null,
        vehicle_plate varchar(20) not null,
        status enum ('EXITED','OVERSTAY','PARKED') not null,
        vehicle_type enum ('BUS','CAR','MOTORBIKE','TRUCK') not null,
        primary key (id)
    ) engine=InnoDB;

create table tickets (
        valid_date date not null,
        booking_id bigint,
        created_at datetime(6),
        customer_id bigint not null,
        id bigint not null auto_increment,
        order_item_id bigint,
        ticket_type_id bigint not null,
        ticket_code varchar(100) not null,
        status enum ('AVAILABLE','CANCELLED','CHECKED_IN','EXPIRED','PAID','REFUNDED','RESERVED','USED') not null,
        primary key (id)
    ) engine=InnoDB;

alter table analytics_events 
       add constraint UKencp1regkpp1iugfcdfb3wnin unique (event_id);

alter table tickets 
       add constraint UKcvl4jbu5fln08ltem9rrmtp8w unique (ticket_code);
