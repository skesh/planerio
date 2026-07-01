import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker"
import { Picker } from "@react-native-picker/picker"
import { filterAvailableForDependency, RepeatPeriod, Todo, type Todo as TodoType } from "@repo/core"
import { format, isValid, parse } from "date-fns"
import { forwardRef, useImperativeHandle, useState } from "react"
import { Platform, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native"
import { useTheme } from "../shared/lib/theme"
import { useProjectSelectors, useTodoActions, useTodoSelectors } from "../store"

const DATE_FORMAT = "dd.MM.yyyy"
const REPEAT_OPTIONS = Object.values(RepeatPeriod)

interface EditTodoFormProps {
  todo: TodoType
  onSave: () => void
}

function parseDate(value: string): Date | undefined {
  if (!value) return undefined
  const d = parse(value, DATE_FORMAT, new Date())
  return isValid(d) ? d : undefined
}

function formatDate(date: Date | undefined): string {
  if (!date) return ""
  return format(date, DATE_FORMAT)
}

function parseTime(value: string): Date | undefined {
  if (!value) return undefined
  const [h, m] = value.split(":").map(Number)
  const d = new Date()
  d.setHours(h || 0, m || 0, 0, 0)
  return d
}

function formatTime(date: Date | undefined): string {
  if (!date) return ""
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}

export const EditTodoForm = forwardRef<{ save: () => void }, EditTodoFormProps>(
  function EditTodoForm({ todo, onSave }, ref) {
    const { colors } = useTheme()
    const { editItemById } = useTodoActions()
    const { projects } = useProjectSelectors()
    const { todos } = useTodoSelectors()
    const otherTodos = filterAvailableForDependency(todos, todo.id)

    const [title, setTitle] = useState(todo.title)
    const [description, setDescription] = useState(todo.description)
    const [tags, setTags] = useState(todo.tags.join(", "))
    const [priority, setPriority] = useState(todo.priority)
    const [date, setDate] = useState(todo.date)
    const [time, setTime] = useState(todo.time)
    const [endDate, setEndDate] = useState(todo.endDate)
    const [repeat, setRepeat] = useState(todo.repeat)
    const [projectId, setProjectId] = useState(todo.projectId)
    const [dependsOn, setDependsOn] = useState<string[]>(todo.dependsOn)

    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showTimePicker, setShowTimePicker] = useState(false)
    const [showEndDatePicker, setShowEndDatePicker] = useState(false)

    useImperativeHandle(ref, () => ({ save: handleSave }))

    function handleSave() {
      editItemById(
        todo.id,
        new Todo({
          ...todo,
          title,
          description,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          priority,
          date,
          time,
          endDate,
          repeat,
          projectId,
          dependsOn,
        }),
      )
      onSave()
    }

    function toggleDependsOn(id: string) {
      setDependsOn((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]))
    }

    function onDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
      setShowDatePicker(false)
      if (event.type === "set" && selectedDate) {
        setDate(formatDate(selectedDate))
      }
    }

    function onTimeChange(event: DateTimePickerEvent, selectedDate?: Date) {
      setShowTimePicker(false)
      if (event.type === "set" && selectedDate) {
        setTime(formatTime(selectedDate))
      }
    }

    function onEndDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
      setShowEndDatePicker(false)
      if (event.type === "set" && selectedDate) {
        setEndDate(formatDate(selectedDate))
      }
    }

    const labelStyle = { color: colors.textMuted, fontSize: 12, textTransform: "uppercase" as const, fontWeight: "500" as const, marginBottom: 4 }
    const inputStyle = { borderColor: colors.border, color: colors.text, fontSize: 16 }
    const dateTextStyle = (hasValue: boolean) => ({ color: hasValue ? colors.text : colors.textMuted, fontSize: 16 })

    return (
      <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
        <Text style={[labelStyle, { marginTop: 16 }]}>Title</Text>
        <TextInput
          className="border rounded-lg px-3 py-2.5 text-base"
          style={inputStyle}
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor="#9ca3af"
        />

        <Text style={[labelStyle, { marginTop: 16 }]}>Description</Text>
        <TextInput
          className="border rounded-lg px-3 py-2.5 text-base"
          style={inputStyle}
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
        />

        <Text style={[labelStyle, { marginTop: 16 }]}>Tags</Text>
        <TextInput
          className="border rounded-lg px-3 py-2.5 text-base"
          style={inputStyle}
          value={tags}
          onChangeText={setTags}
          placeholder="tag1, tag2, tag3"
          placeholderTextColor="#9ca3af"
        />

        <View className="flex-row items-center justify-between mt-4">
          <Text style={[labelStyle, { flex: 1, marginBottom: 0 }]}>Priority</Text>
          <Switch value={priority} onValueChange={setPriority} />
        </View>

        <View className="flex-row gap-3 mt-4">
          <View className="flex-1">
            <Text style={labelStyle}>Date</Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="border rounded-lg px-3 py-2.5"
              style={{ borderColor: colors.border }}
            >
              <Text style={dateTextStyle(!!date)}>
                {date || "Select date"}
              </Text>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={parseDate(date) || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={onDateChange}
              />
            )}
          </View>
          <View className="flex-1">
            <Text style={labelStyle}>Time</Text>
            <Pressable
              onPress={() => setShowTimePicker(true)}
              className="border rounded-lg px-3 py-2.5"
              style={{ borderColor: colors.border }}
            >
              <Text style={dateTextStyle(!!time)}>
                {time || "Select time"}
              </Text>
            </Pressable>
            {showTimePicker && (
              <DateTimePicker
                value={parseTime(time) || new Date()}
                mode="time"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={onTimeChange}
              />
            )}
          </View>
        </View>

        <Text style={[labelStyle, { marginTop: 16 }]}>End date</Text>
        <Pressable
          onPress={() => setShowEndDatePicker(true)}
          className="border rounded-lg px-3 py-2.5"
          style={{ borderColor: colors.border }}
        >
          <Text style={dateTextStyle(!!endDate)}>
            {endDate || "Select end date"}
          </Text>
        </Pressable>
        {showEndDatePicker && (
          <DateTimePicker
            value={parseDate(endDate) || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={onEndDateChange}
          />
        )}

        <Text style={[labelStyle, { marginTop: 16 }]}>Repeat</Text>
        <View className="border rounded-lg" style={{ borderColor: colors.border }}>
          <Picker
            selectedValue={repeat ?? ""}
            onValueChange={(v) => setRepeat((v || undefined) as RepeatPeriod | undefined)}
          >
            <Picker.Item label="No repeat" value="" />
            {REPEAT_OPTIONS.map((opt) => (
              <Picker.Item key={opt} label={opt} value={opt} />
            ))}
          </Picker>
        </View>

        <Text style={[labelStyle, { marginTop: 16 }]}>Project</Text>
        <View className="border rounded-lg" style={{ borderColor: colors.border }}>
          <Picker selectedValue={projectId} onValueChange={setProjectId}>
            <Picker.Item label="No project" value="" />
            {projects.map((p) => (
              <Picker.Item key={p.id} label={p.name} value={p.id} />
            ))}
          </Picker>
        </View>

        {otherTodos.length > 0 && (
          <>
            <Text style={[labelStyle, { marginTop: 16 }]}>Depends on</Text>
            {otherTodos.map((t) => {
              const checked = dependsOn.includes(t.id)
              return (
                <Pressable
                  key={t.id}
                  onPress={() => toggleDependsOn(t.id)}
                  className="flex-row items-center py-2"
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      borderWidth: 2,
                      borderColor: checked ? "#6366f1" : "#d1d5db",
                      backgroundColor: checked ? "#6366f1" : "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 8,
                    }}
                  >
                    {checked && (
                      <Text style={{ color: "white", fontSize: 11, fontWeight: "700" }}>✓</Text>
                    )}
                  </View>
                  <Text className="text-sm flex-1" style={{ color: colors.text }}>{t.title}</Text>
                </Pressable>
              )
            })}
          </>
        )}

        <View className="h-16" />
      </ScrollView>
    )
  },
)
