import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  advanceStudioChat,
  createStudioChatState,
  isStudioChatApproveReady,
  seedStudioChatVertical,
  studioChatIntroMessage,
} from "@/lib/webapp/studio-chat/engine";

describe("studio chat engine", () => {
  it("returns bilingual intros", () => {
    assert.match(studioChatIntroMessage("English"), /describe the business app/i);
    assert.match(studioChatIntroMessage("Arabic"), /صف لي التطبيق/);
  });

  it("clarifies then plans then builds on approve", () => {
    let state = createStudioChatState("English");

    let reply = advanceStudioChat(state, "I need a sales CRM for my company");
    assert.equal(reply.state.vertical, "crm");
    assert.equal(reply.state.phase, "clarify");
    assert.equal(reply.plan, null);
    assert.ok(!isStudioChatApproveReady(reply));

    state = reply.state;
    reply = advanceStudioChat(state, "Sales team of 8 reps");
    assert.equal(reply.state.users, "Sales team of 8 reps");
    assert.equal(reply.state.phase, "clarify");

    state = reply.state;
    reply = advanceStudioChat(state, "Deals pipeline and follow-up tasks");
    assert.equal(reply.state.phase, "plan");
    assert.ok(reply.plan);
    assert.equal(reply.plan?.templateId, "crm");
    assert.equal(reply.plan?.appType, "crm");
    assert.ok(!isStudioChatApproveReady(reply));

    state = reply.state;
    reply = advanceStudioChat(state, "Approve");
    assert.equal(reply.state.phase, "ready");
    assert.ok(isStudioChatApproveReady(reply));
    assert.equal(reply.plan?.readyToBuild, true);
  });

  it("detects Arabic CRM and accepts موافقة", () => {
    let state = createStudioChatState("Arabic");
    let reply = advanceStudioChat(state, "أحتاج نظام مبيعات لتتبع العملاء والصفقات");
    assert.equal(reply.state.vertical, "crm");

    state = reply.state;
    reply = advanceStudioChat(state, "فريق المبيعات");
    state = reply.state;
    reply = advanceStudioChat(state, "لوحة صفقات ومتابعة");
    assert.equal(reply.state.phase, "plan");
    assert.match(reply.plan?.title ?? "", /مبيعات|CRM/);

    state = reply.state;
    reply = advanceStudioChat(state, "موافق");
    assert.ok(isStudioChatApproveReady(reply));
  });

  it("maps booking vertical keywords", () => {
    const reply = advanceStudioChat(
      createStudioChatState("English"),
      "Build a booking system for my salon appointments",
    );
    assert.equal(reply.state.vertical, "booking");
  });

  it("seeds vertical from onboarding and skips vertical question", () => {
    const seeded = seedStudioChatVertical(
      createStudioChatState("English"),
      "crm",
      "English",
    );
    assert.equal(seeded.state.vertical, "crm");
    assert.equal(seeded.state.phase, "clarify");
    assert.match(seeded.assistantMessage, /who will use it daily/i);

    const reply = advanceStudioChat(seeded.state, "Sales team");
    assert.equal(reply.state.users, "Sales team");
    assert.equal(reply.state.phase, "clarify");
  });
});
