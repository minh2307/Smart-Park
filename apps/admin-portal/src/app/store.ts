import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from '../features/auth/store/authSlice';
import analyticsReducer from '../features/analytics/store/analyticsSlice';
import themeReducer from '../theme/themeSlice';
import { authApi } from '../features/auth/services/authApi';
import { userApi } from '../features/user/services/userApi';

import { ticketApi } from '../features/ticket/services/ticketApi';
import { bookingApi } from '../features/booking/services/bookingApi';
import { customerApi } from '../features/customer/services/customerApi';
import { visitorApi } from '../features/visitor/services/visitorApi';
import { rideApi } from '../features/ride/services/rideApi';
import { rideCategoryApi } from '../features/ride-category/services/rideCategoryApi';
import { membershipApi } from '../features/membership/services/membershipApi';
import { loyaltyApi } from '../features/loyalty/services/loyaltyApi';
import { campaignApi } from '../features/campaign/services/campaignApi';
import { promotionApi } from '../features/promotion/services/promotionApi';
import { couponApi } from '../features/coupon/services/couponApi';
import { voucherApi } from '../features/voucher/services/voucherApi';
import { gateApi } from '../features/gate/services/gateApi';
import { validationApi } from '../features/ticket-validation/services/validationApi';
import { parkingApi } from '../features/parking/services/parkingApi';
import { lockerApi } from '../features/locker/services/lockerApi';
import { foodCourtApi } from '../features/food-court/services/foodCourtApi';
import { retailApi } from '../features/retail/services/retailApi';
import { posApi } from '../features/pos/services/posApi';
import { notificationApi } from '../features/notification/services/notificationApi';
import { announcementApi } from '../features/announcement/services/announcementApi';
import { emailTemplateApi } from '../features/email-template/services/emailTemplateApi';
import { smsTemplateApi } from '../features/sms-template/services/smsTemplateApi';
import { pushApi } from '../features/push/services/pushApi';
import { feedbackApi } from '../features/feedback/services/feedbackApi';
import { complaintApi } from '../features/complaint/services/complaintApi';
import { incidentApi } from '../features/incident/services/incidentApi';
import { supportApi } from '../features/support/services/supportApi';
import { knowledgeBaseApi } from '../features/knowledge-base/services/knowledgeBaseApi';
import { analyticsApi } from '../features/analytics/services/analyticsApi';
import { venueApi } from '../features/venue/services/venueApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [venueApi.reducerPath]: venueApi.reducer,

    [ticketApi.reducerPath]: ticketApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [visitorApi.reducerPath]: visitorApi.reducer,
    [rideApi.reducerPath]: rideApi.reducer,
    [rideCategoryApi.reducerPath]: rideCategoryApi.reducer,
    [membershipApi.reducerPath]: membershipApi.reducer,
    [loyaltyApi.reducerPath]: loyaltyApi.reducer,
    [campaignApi.reducerPath]: campaignApi.reducer,
    [promotionApi.reducerPath]: promotionApi.reducer,
    [couponApi.reducerPath]: couponApi.reducer,
    [voucherApi.reducerPath]: voucherApi.reducer,
    [gateApi.reducerPath]: gateApi.reducer,
    [validationApi.reducerPath]: validationApi.reducer,
    [parkingApi.reducerPath]: parkingApi.reducer,
    [lockerApi.reducerPath]: lockerApi.reducer,
    [foodCourtApi.reducerPath]: foodCourtApi.reducer,
    [retailApi.reducerPath]: retailApi.reducer,
    [posApi.reducerPath]: posApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [announcementApi.reducerPath]: announcementApi.reducer,
    [emailTemplateApi.reducerPath]: emailTemplateApi.reducer,
    [smsTemplateApi.reducerPath]: smsTemplateApi.reducer,
    [pushApi.reducerPath]: pushApi.reducer,
    [feedbackApi.reducerPath]: feedbackApi.reducer,
    [complaintApi.reducerPath]: complaintApi.reducer,
    [incidentApi.reducerPath]: incidentApi.reducer,
    [supportApi.reducerPath]: supportApi.reducer,
    [knowledgeBaseApi.reducerPath]: knowledgeBaseApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    analytics: analyticsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      userApi.middleware,
      venueApi.middleware,

      ticketApi.middleware,
      bookingApi.middleware,
      customerApi.middleware,
      visitorApi.middleware,
      rideApi.middleware,
      rideCategoryApi.middleware,
      membershipApi.middleware,
      loyaltyApi.middleware,
      campaignApi.middleware,
      promotionApi.middleware,
      couponApi.middleware,
      voucherApi.middleware,
      gateApi.middleware,
      validationApi.middleware,
      parkingApi.middleware,
      lockerApi.middleware,
      foodCourtApi.middleware,
      retailApi.middleware,
      posApi.middleware,
      notificationApi.middleware,
      announcementApi.middleware,
      emailTemplateApi.middleware,
      smsTemplateApi.middleware,
      pushApi.middleware,
      feedbackApi.middleware,
      complaintApi.middleware,
      incidentApi.middleware,
      supportApi.middleware,
      knowledgeBaseApi.middleware,
      analyticsApi.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
