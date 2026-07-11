create table locker_transactions (
        amount_paid decimal(15,2),
        customer_id bigint not null,
        end_time datetime(6),
        id bigint not null auto_increment,
        locker_id bigint not null,
        start_time datetime(6) not null,
        status enum ('ACTIVE','COMPLETED','OVERDUE') not null,
        primary key (id)
    ) engine=InnoDB;

create table lockers (
        created_at datetime(6),
        id bigint not null auto_increment,
        zone_id bigint not null,
        locker_code varchar(20) not null,
        size enum ('LARGE','MEDIUM','SMALL') not null,
        status enum ('AVAILABLE','OCCUPIED','OUT_OF_ORDER') not null,
        primary key (id)
    ) engine=InnoDB;

create table ride_capacities (
        booked_count integer not null,
        current_waiting_count integer not null,
        max_capacity integer not null,
        time_slot time(6) not null,
        id bigint not null auto_increment,
        ride_id bigint not null,
        primary key (id)
    ) engine=InnoDB;

create table ride_categories (
        created_at datetime(6),
        id bigint not null auto_increment,
        name varchar(100) not null,
        description TEXT,
        primary key (id)
    ) engine=InnoDB;

create table ride_inspections (
        inspection_date date not null,
        created_at datetime(6),
        id bigint not null auto_increment,
        inspector_id bigint not null,
        ride_id bigint not null,
        result_details TEXT,
        status enum ('FAIL','PASS') not null,
        primary key (id)
    ) engine=InnoDB;

create table ride_maintenances (
        completion_date date,
        cost decimal(15,2),
        scheduled_date date not null,
        created_at datetime(6),
        end_time datetime(6) not null,
        id bigint not null auto_increment,
        ride_id bigint not null,
        start_time datetime(6) not null,
        technician_id bigint,
        updated_at datetime(6),
        description TEXT,
        notes TEXT,
        reason varchar(255),
        status enum ('AWAITING_REVIEW','CANCELLED','COMPLETED','IN_PROGRESS','SCHEDULED') not null,
        primary key (id)
    ) engine=InnoDB;

create table ride_schedules (
        end_time time(6) not null,
        shift_date date not null,
        start_time time(6) not null,
        employee_id bigint not null,
        id bigint not null auto_increment,
        ride_id bigint not null,
        status enum ('ACTIVE','CANCELLED','COMPLETED','SCHEDULED') not null,
        primary key (id)
    ) engine=InnoDB;

create table rides (
        capacity integer not null,
        duration_seconds integer,
        max_height float(53),
        min_height float(53),
        created_at datetime(6),
        id bigint not null auto_increment,
        ride_category_id bigint,
        updated_at datetime(6),
        zone_id bigint not null,
        code varchar(20) not null,
        name varchar(150) not null,
        description TEXT,
        status enum ('ACTIVE','CLOSED','MAINTENANCE','TEMPORARY_STOP') not null,
        primary key (id)
    ) engine=InnoDB;

alter table lockers 
       add constraint UKgu096yvi6nvupc0pgi5ceqfg4 unique (locker_code);

alter table rides 
       add constraint UKrcmh0858jce0afm1e175ky7nn unique (code);
