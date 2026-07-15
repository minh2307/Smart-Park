package com.smartpark.domain.turnstile.service;
import com.smartpark.domain.audit.service.AuditLogService;
import com.smartpark.domain.device.entity.IoTDevice;
import com.smartpark.domain.device.repository.IoTDeviceRepository;
import com.smartpark.domain.device.service.ReplayProtectionService;
import com.smartpark.domain.park.entity.Park;
import com.smartpark.domain.park.repository.ZoneRepository;
import com.smartpark.domain.ticket.entity.*;
import com.smartpark.domain.ticket.repository.*;
import com.smartpark.domain.turnstile.dto.*;
import com.smartpark.domain.turnstile.entity.TurnstileScanEvent;
import com.smartpark.domain.turnstile.repository.TurnstileScanEventRepository;
import org.junit.jupiter.api.*;
import org.mockito.*;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class TurnstileServiceTest {
 @Mock IoTDeviceRepository devices;@Mock TicketRepository tickets;@Mock CheckInRepository checkIns;@Mock ZoneRepository zones;@Mock TurnstileScanEventRepository events;@Mock ReplayProtectionService replay;@Mock AuditLogService audit;@Mock com.smartpark.domain.settings.service.FeatureFlagService featureFlags;@Mock com.smartpark.domain.device.service.DeviceRateLimitService deviceRateLimit;@InjectMocks TurnstileService service;
 @BeforeEach void init(){MockitoAnnotations.openMocks(this);}
 @Test void validTicketOpensOnceAndPersistsCheckIn(){Park park=Park.builder().id(1L).build();IoTDevice device=IoTDevice.builder().id(3L).deviceCode("GATE-01").deviceType(IoTDevice.DeviceType.TURNSTILE).status(IoTDevice.DeviceStatus.ACTIVE).park(park).build();TicketType type=TicketType.builder().park(park).build();Ticket ticket=Ticket.builder().id(7L).ticketCode("TKT-1").ticketType(type).status(Ticket.TicketStatus.PAID).validDate(LocalDate.now()).build();when(devices.findByDeviceCode("GATE-01")).thenReturn(Optional.of(device));when(events.findByDeviceDeviceCodeAndRequestId("GATE-01","req-1")).thenReturn(Optional.empty());when(tickets.findByTicketCodeForUpdate("TKT-1")).thenReturn(Optional.of(ticket));when(events.saveAndFlush(any())).thenAnswer(i->{TurnstileScanEvent e=i.getArgument(0);e.setId(9L);return e;});var response=service.process(new TurnstileRequest("GATE-01","TKT-1",1L,null,LocalDateTime.now(),"req-1"));assertEquals(TurnstileResponse.Decision.ALLOW,response.decision());assertEquals(TurnstileResponse.Command.OPEN,response.command());assertEquals(Ticket.TicketStatus.CHECKED_IN,ticket.getStatus());verify(checkIns).save(any(CheckIn.class));}
 @Test void inactiveDeviceAlwaysKeepsClosed(){Park park=Park.builder().id(1L).build();IoTDevice d=IoTDevice.builder().deviceCode("GATE-X").deviceType(IoTDevice.DeviceType.TURNSTILE).status(IoTDevice.DeviceStatus.REVOKED).park(park).build();when(devices.findByDeviceCode("GATE-X")).thenReturn(Optional.of(d));var response=service.process(new TurnstileRequest("GATE-X","TKT",1L,null,LocalDateTime.now(),"req"));assertEquals(TurnstileResponse.Command.KEEP_CLOSED,response.command());verifyNoInteractions(tickets,checkIns);}
}
