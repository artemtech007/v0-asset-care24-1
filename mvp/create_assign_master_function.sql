-- =============================================================================
-- PostgreSQL функция для назначения мастера на заявку
-- Обеспечивает транзакционность и целостность данных
-- =============================================================================

CREATE OR REPLACE FUNCTION assign_master_to_request(
    p_request_id bigint,
    p_master_id text,
    p_admin_comment text DEFAULT 'Мастер назначен администратором'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_request_status text;
    v_candidate_exists boolean;
    v_result jsonb;
BEGIN
    -- Проверяем, существует ли заявка
    SELECT status INTO v_request_status
    FROM requests
    WHERE id = p_request_id;

    IF v_request_status IS NULL THEN
        RAISE EXCEPTION 'Request with ID % not found', p_request_id;
    END IF;

    -- Проверяем, что заявка находится в подходящем статусе
    IF v_request_status NOT IN ('waiting_candidates', 'candidates_collecting', 'master_selection') THEN
        RAISE EXCEPTION 'Cannot assign master to request with status %', v_request_status;
    END IF;

    -- Проверяем, что кандидат существует для этой заявки
    SELECT EXISTS(
        SELECT 1 FROM request_candidates
        WHERE request_id = p_request_id AND master_id = p_master_id
    ) INTO v_candidate_exists;

    IF NOT v_candidate_exists THEN
        -- Если кандидата нет, создаем его автоматически
        INSERT INTO request_candidates (
            request_id,
            master_id,
            status,
            admin_comment,
            selected_at
        ) VALUES (
            p_request_id,
            p_master_id,
            'selected',
            p_admin_comment,
            now()
        );
    ELSE
        -- Обновляем существующего кандидата
        UPDATE request_candidates
        SET
            status = 'selected',
            admin_comment = p_admin_comment,
            selected_at = now()
        WHERE request_id = p_request_id AND master_id = p_master_id;
    END IF;

    -- Отклоняем остальных кандидатов
    UPDATE request_candidates
    SET status = 'rejected'
    WHERE request_id = p_request_id AND master_id != p_master_id;

    -- Обновляем основную заявку
    UPDATE requests
    SET
        master_id = p_master_id,
        status = 'master_assigned',
        assigned_at = now(),
        admin_comment = COALESCE(admin_comment, '') || ' | ' || p_admin_comment
    WHERE id = p_request_id;

    -- Возвращаем результат
    v_result := jsonb_build_object(
        'request_id', p_request_id,
        'master_id', p_master_id,
        'status', 'master_assigned',
        'assigned_at', now(),
        'admin_comment', p_admin_comment
    );

    RETURN v_result;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error assigning master to request: %', SQLERRM;
END;
$$;

-- =============================================================================
-- Даем права на выполнение функции
-- =============================================================================

GRANT EXECUTE ON FUNCTION assign_master_to_request(bigint, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION assign_master_to_request(bigint, text, text) TO service_role;

-- =============================================================================
-- Проверка создания функции
-- =============================================================================

SELECT
    'Function created successfully' as status,
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc
WHERE proname = 'assign_master_to_request';
