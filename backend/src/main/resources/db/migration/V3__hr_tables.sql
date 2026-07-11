create table departments (
        created_at datetime(6),
        id bigint not null auto_increment,
        manager_id bigint,
        code varchar(20) not null,
        name varchar(100) not null,
        description varchar(200),
        primary key (id)
    ) engine=InnoDB;

create table employee_departments (
        end_date date,
        start_date date not null,
        department_id bigint not null,
        employee_id bigint not null,
        id bigint not null auto_increment,
        primary key (id)
    ) engine=InnoDB;

create table employees (
        hire_date date,
        salary decimal(15,2),
        created_at datetime(6),
        id bigint not null auto_increment,
        updated_at datetime(6),
        user_id bigint,
        phone varchar(20),
        email varchar(100),
        full_name varchar(100) not null,
        status enum ('ACTIVE','INACTIVE','RESIGNED') not null,
        primary key (id)
    ) engine=InnoDB;

alter table departments 
       add constraint UKl7tivi5261wxdnvo6cct9gg6t unique (code);

alter table employees 
       add constraint UKgnponadwwxr5nm2tqe5b905hs unique (phone);
