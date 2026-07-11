alter table bookings 
       add constraint FKbvfibgflhsb0g2hnjauiv5khs 
       foreign key (customer_id) 
       references customers (id);

alter table check_ins 
       add constraint FKjtojxw2s9hpyc9c2wtg8vonoy 
       foreign key (ticket_id) 
       references tickets (id);

alter table check_ins 
       add constraint FK5px2u1t7fhcow3bmt23tjwhqw 
       foreign key (zone_id) 
       references zones (id);

alter table coupon_usages 
       add constraint FK3mvslb8gc0ac6501mfmvifgva 
       foreign key (coupon_id) 
       references coupons (id);

alter table coupon_usages 
       add constraint FKd30ko7bjpbr9sg8lwwomu6w96 
       foreign key (customer_id) 
       references customers (id);

alter table coupons 
       add constraint FKof48ev4n1l7iu0e61kehdhsic 
       foreign key (promotion_id) 
       references promotions (id);

alter table employee_departments 
       add constraint FKl6dflqopcc7p1o7aw803hsako 
       foreign key (department_id) 
       references departments (id);

alter table employee_departments 
       add constraint FKsjac7c38kbqbr68p1w7m3h1qk 
       foreign key (employee_id) 
       references employees (id);

alter table feedbacks 
       add constraint FKi9b9keigxngo4a35fgwt4h2v6 
       foreign key (customer_id) 
       references customers (id);

alter table food_courts 
       add constraint FKnd9hslqu06btovyahl9kwsuaw 
       foreign key (park_id) 
       references parks (id);

alter table food_items 
       add constraint FKt63s7glpn2ydeonu2godeqc9w 
       foreign key (food_stall_id) 
       references food_stalls (id);

alter table food_stalls 
       add constraint FKebgc5ubscw9mlphu6oe4vs8un 
       foreign key (food_court_id) 
       references food_courts (id);

alter table incidents 
       add constraint FK5qjayn7apxok9522yiao3268t 
       foreign key (zone_id) 
       references zones (id);

alter table locker_transactions 
       add constraint FKap6hgb9dueyyr9en8brbbt31e 
       foreign key (customer_id) 
       references customers (id);

alter table locker_transactions 
       add constraint FKt5gg7aeiae57j4ejyrqxpwxwl 
       foreign key (locker_id) 
       references lockers (id);

alter table lockers 
       add constraint FKpm0wcgb3o4n61lvwk44oy9tl3 
       foreign key (zone_id) 
       references zones (id);

alter table memberships 
       add constraint FKka88q9s0erhb3aevxupqkwh5e 
       foreign key (customer_id) 
       references customers (id);

alter table memberships 
       add constraint FKhg1ormdijj0lvfjshem61bao5 
       foreign key (tier_id) 
       references membership_tiers (id);

alter table order_items 
       add constraint FKbioxgbv59vetrxe0ejfubep1w 
       foreign key (order_id) 
       references orders (id);

alter table orders 
       add constraint FKpxtb8awmi0dk6smoh2vp1litg 
       foreign key (customer_id) 
       references customers (id);

alter table parking_lots 
       add constraint FKqw7whsq49h2d2ikk9mygxno4k 
       foreign key (park_id) 
       references parks (id);

alter table parking_transactions 
       add constraint FK63cgetbeqlw1ysj93uhlyfeho 
       foreign key (parking_lot_id) 
       references parking_lots (id);

alter table payments 
       add constraint FK81gagumt0r8y3rmudcgpbk42l 
       foreign key (order_id) 
       references orders (id);

alter table payments 
       add constraint FKce1n8pa67lq4l57l9mhugdgab 
       foreign key (payment_method_id) 
       references payment_methods (id);

alter table point_histories 
       add constraint FKmqpqq6cky4qt67l8fc14xga99 
       foreign key (membership_id) 
       references memberships (id);

alter table refunds 
       add constraint FKpt9ic0j1y6xwlej99wnynvnpy 
       foreign key (payment_id) 
       references payments (id);

alter table retail_items 
       add constraint FKouo18ba719n7l8u6pivhvxdar 
       foreign key (retail_shop_id) 
       references retail_shops (id);

alter table retail_shops 
       add constraint FKla6igmr5e7t0x4k0igvt0soa3 
       foreign key (park_id) 
       references parks (id);

alter table ride_capacities 
       add constraint FKcjf77hpn7p1skphdjnfgvwmjg 
       foreign key (ride_id) 
       references rides (id);

alter table ride_inspections 
       add constraint FK92h1oyxs211w767rdusegcmji 
       foreign key (ride_id) 
       references rides (id);

alter table ride_maintenances 
       add constraint FKdpbeb29uoeysb4i4e0pqqgr76 
       foreign key (ride_id) 
       references rides (id);

alter table ride_schedules 
       add constraint FKbxccpbhm4koxh8ofc4rh3kgi5 
       foreign key (ride_id) 
       references rides (id);

alter table rides 
       add constraint FKhwsppcy5227afkambcavqqk00 
       foreign key (ride_category_id) 
       references ride_categories (id);

alter table rides 
       add constraint FKq4q679p8i0xi0j8fdstd7ppmi 
       foreign key (zone_id) 
       references zones (id);

alter table role_permissions 
       add constraint FKegdk29eiy7mdtefy5c7eirr6e 
       foreign key (permission_id) 
       references permissions (id);

alter table role_permissions 
       add constraint FKn5fotdgk8d1xvo8nav9uv3muc 
       foreign key (role_id) 
       references roles (id);

alter table ticket_pricings 
       add constraint FK1jahmr8nqh57us7fl5hhg9ke 
       foreign key (ticket_type_id) 
       references ticket_types (id);

alter table ticket_types 
       add constraint FKtjpstpubjndnl8pwqvxxo7t2q 
       foreign key (park_id) 
       references parks (id);

alter table tickets 
       add constraint FKefja4avuu7g29t78mxifrsynb 
       foreign key (booking_id) 
       references bookings (id);

alter table tickets 
       add constraint FKi81xre2n3j3as1sp24j440kq1 
       foreign key (customer_id) 
       references customers (id);

alter table tickets 
       add constraint FKotik7mbbb14hu8n9og7o92k5h 
       foreign key (ticket_type_id) 
       references ticket_types (id);

alter table user_roles 
       add constraint FKh8ciramu9cc9q3qcqiv4ue8a6 
       foreign key (role_id) 
       references roles (id);

alter table user_roles 
       add constraint FKhfh9dx7w3ubf1co1vdev94g3f 
       foreign key (user_id) 
       references users (id);

alter table zones 
       add constraint FKfdqtsjwvy7e75mco9mt9vqi72 
       foreign key (park_id) 
       references parks (id);
