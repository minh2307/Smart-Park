create table audit_logs (
        created_at datetime(6),
        id bigint not null auto_increment,
        record_id bigint,
        user_id bigint,
        action varchar(20) not null,
        ip_address varchar(45),
        target_table varchar(100) not null,
        new_values TEXT,
        old_values TEXT,
        primary key (id)
    ) engine=InnoDB;

create table permissions (
        created_at datetime(6),
        id bigint not null auto_increment,
        code varchar(100) not null,
        name varchar(100) not null,
        description varchar(200),
        primary key (id)
    ) engine=InnoDB;

create table role_permissions (
        permission_id bigint not null,
        role_id bigint not null,
        primary key (permission_id, role_id)
    ) engine=InnoDB;

create table roles (
        created_at datetime(6),
        id bigint not null auto_increment,
        code varchar(50) not null,
        name varchar(50) not null,
        description varchar(200),
        primary key (id)
    ) engine=InnoDB;

create table security_audit_logs (
        created_at datetime(6),
        id bigint not null auto_increment,
        user_id bigint not null,
        ip_address varchar(50),
        action varchar(100) not null,
        primary key (id)
    ) engine=InnoDB;

create table user_roles (
        role_id bigint not null,
        user_id bigint not null,
        primary key (role_id, user_id)
    ) engine=InnoDB;

create table users (
        failed_login_attempts integer,
        created_at datetime(6),
        id bigint not null auto_increment,
        locked_until datetime(6),
        updated_at datetime(6),
        email varchar(100) not null,
        username varchar(100) not null,
        password_hash varchar(255) not null,
        status enum ('ACTIVE','DISABLED','LOCKED') not null,
        primary key (id)
    ) engine=InnoDB;

alter table permissions 
       add constraint UK7lcb6glmvwlro3p2w2cewxtvd unique (code);

alter table permissions 
       add constraint UKpnvtwliis6p05pn6i3ndjrqt2 unique (name);

alter table roles 
       add constraint UKch1113horj4qr56f91omojv8 unique (code);

alter table roles 
       add constraint UKofx66keruapi6vyqpv6f2or37 unique (name);

alter table users 
       add constraint UK6dotkott2kjsp8vw4d0m25fb7 unique (email);

alter table users 
       add constraint UKr43af9ap4edm43mmtq01oddj6 unique (username);
