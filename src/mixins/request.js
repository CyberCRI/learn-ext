import reqwest from 'reqwest'
import Enum from 'enum'

// Flags for Network States.
// An `idle` state signifies that no request are sent.
// It reaches `inflight` state during the whole request process. Note that this
// is a bit confusing notation -- it's not same as XHR preflight state where
// it makes an `OPTION` request for CORS parameters.
//
// A basic anatomy of a request is shown below. Notice both complete and failed
// states are still "completed".
//                                      ┌────────────┐
// ┌──────┐  ┌────────────────┐         │┌──────────┐│
// │Idle  │──▶Inflight        │────┬────▶│ Complete ││
// └──────┘  └─────┬──────────┘    │    │└──────────┘│
//                 │               │    │┌──────────┐│
//                 │  ┌──────────┐ └────▶│  Failed  ││
//                 └─▶│Cancelled │      │└──────────┘│
//                    └──────────┘      └────────────┘
export const NETSTATE = new Enum([
  'idle',
  'inflight',
  'failed',
  'cancelled',
  'complete',
])


export const request = (params) => {
  // Wrap `reqwest` with common flags and parameters.
  // Additionally, a `cancel` method is attached allowing distinguishing errors
  // from a cancelled AJAX request.

  const defaults = {
    type: 'json',
    method: 'get',
    contentType: 'application/json',
  }

  let payload = {...defaults, ...params}

  if (payload.method !== 'get' && payload.data) {
    payload.data = JSON.stringify(payload.data)
  }

  const r = reqwest(payload)

  r.cancel = () => {
    r.request.cancelled = true
    r.abort()
  }
  return r
}
